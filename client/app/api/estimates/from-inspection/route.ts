import { connectToDatabase } from '@/lib/db';
import Estimate from '@/lib/models/Estimate';
import VehicleInspection, { IVehicleInspection } from '@/lib/models/VehicleInspection';
import { getServerSession } from "@/lib/auth-server";
import { PartMatchingService } from '@/lib/services/PartMatchingService';
import { NextRequest, NextResponse } from 'next/server';

type PopulatedInspection = Omit<IVehicleInspection, 'vehicleId' | 'customerId' | 'mechanicId'> & {
    vehicleId: { _id: string; make: string; model: string; year: number } | null;
    customerId: { _id: string; firstName: string; lastName: string } | null;
    mechanicId: { _id: string; userId: string } | null;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { inspectionId, selectedItems } = body;

    if (!inspectionId) {
        return NextResponse.json({ error: 'Inspection ID is required' }, { status: 400 });
    }

    const inspection = await VehicleInspection.findById(inspectionId)
      .populate('vehicleId', 'make model year')
      .populate('customerId', 'firstName lastName')
      .populate('mechanicId', 'userId')
      .lean<PopulatedInspection>();

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    if (!inspection.vehicleId || !inspection.customerId) {
        return NextResponse.json({ error: 'Inspection is missing vehicle or customer information' }, { status: 400 });
    }

    // Filter inspection items based on selectedItems if provided
    // Otherwise, use all items that need repair (fair, poor, critical)
    let itemsToProcess = inspection.items;
    if (selectedItems && Array.isArray(selectedItems) && selectedItems.length > 0) {
      const selectedItemIds = new Set(selectedItems.map((item: any) => item.itemId));
      itemsToProcess = inspection.items.filter((item: any) => selectedItemIds.has(item.itemId));
      console.log(`[Estimate API] Using ${itemsToProcess.length} selected items from ${inspection.items.length} total items`);
    } else {
      // Auto-select items that need repair
      itemsToProcess = inspection.items.filter((item: any) =>
        item.condition === 'fair' || item.condition === 'poor' || item.condition === 'critical'
      );
      console.log(`[Estimate API] Auto-selected ${itemsToProcess.length} items needing repair from ${inspection.items.length} total items`);
    }

    if (itemsToProcess.length === 0) {
      return NextResponse.json({
        error: 'No items to process',
        message: 'No items selected or needing repair found in the inspection'
      }, { status: 400 });
    }

    // Use the PartMatchingService to get required parts and services
    const partMatcher = new PartMatchingService();
    const matchedItems = await partMatcher.matchInspectionItems(itemsToProcess, inspection.vehicleId);

    const estimateServices: any[] = [];
    const estimateParts: any[] = [];
    
    // Group by service to consolidate parts under one service entry
    const serviceMap = new Map<string, any>();

    for (const item of matchedItems) {
        if (item.service) {
            if (!serviceMap.has(item.service._id)) {
                serviceMap.set(item.service._id, {
                    serviceId: item.service._id,
                    name: item.service.name,
                    description: `Service for: ${item.inspectionItem.name}`,
                    quantity: 1, // Assume one service operation
                    laborHours: item.service.laborHours,
                    laborRate: item.service.laborRate,
                    parts: [],
                });
            }
            if (item.part) {
                serviceMap.get(item.service._id).parts.push({
                    partId: item.part._id,
                    name: item.part.name,
                    quantity: item.quantity,
                    unitCost: item.part.sellingPrice,
                    totalCost: item.part.sellingPrice * item.quantity,
                });
            }
        } else if (item.part) {
            // If a part is matched without a service, add it directly to estimate parts
            estimateParts.push({
                partId: item.part._id,
                name: item.part.name,
                description: `Part for: ${item.inspectionItem.name}`,
                quantity: item.quantity,
                unitCost: item.part.sellingPrice,
                totalCost: item.part.sellingPrice * item.quantity,
            });
        }
    }

    // Convert map to estimate services array
    for (const [, service] of serviceMap) {
        const partsCost = service.parts.reduce((sum: number, p: any) => sum + p.totalCost, 0);
        const laborCost = service.laborHours * service.laborRate;
        estimateServices.push({
            serviceId: service.serviceId,
            name: service.name,
            description: service.description,
            quantity: service.quantity,
            laborHours: service.laborHours,
            laborRate: service.laborRate,
            laborCost: laborCost,
            partsCost: partsCost,
            totalCost: laborCost + partsCost,
        });
        // Add parts from services to the main parts list for display
        estimateParts.push(...service.parts);
    }

    const servicesTotal = estimateServices.reduce((sum, s) => sum + s.totalCost, 0);
    const partsTotalForTax = estimateParts.reduce((sum, p) => sum + p.totalCost, 0);
    
    const subtotal = servicesTotal; // Service total already includes parts cost
    const tax = partsTotalForTax * 0.15; // 15% tax ONLY on parts
    const total = subtotal + tax;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    const tenantId = (session.user as any).tenantId;

    const estimate = new Estimate({
      tenantId,
      inspectionId: inspection._id,
      customerId: inspection.customerId._id,
      vehicleId: inspection.vehicleId._id,
      mechanicId: inspection.mechanicId?._id,
      services: estimateServices,
      parts: estimateParts,
      subtotal,
      tax,
      total,
      validUntil,
      status: 'pending',
      notes: `Generated from inspection on ${new Date(inspection.inspectionDate).toLocaleDateString()}. ${itemsToProcess.length} items included.`
    });

    await estimate.save();

    const populatedEstimate = await Estimate.findById(estimate._id)
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year')
      .populate('services.serviceId', 'name')
      .populate('parts.partId', 'name')
      .lean();

    return NextResponse.json({ 
      success: true, 
      estimate: populatedEstimate
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating estimate from inspection:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create estimate from inspection', details: errorMessage }, { status: 500 });
  }
}

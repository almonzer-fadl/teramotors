import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import JobCard from '@/lib/models/JobCard';
import VehicleInspection from '@/lib/models/VehicleInspection';
import Estimate, { IEstimate } from '@/lib/models/Estimate';
import Invoice, { IInvoice } from '@/lib/models/Invoice';
import { getServerSession } from '@/lib/auth-server';
import { INSPECTION_CONFIG } from '@/lib/config/inspection';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const tenantId = (session.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized - No tenant assigned' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { estimateId } = body;

    if (!estimateId) {
      return NextResponse.json({ error: 'Estimate ID is required' }, { status: 400 });
    }

    // 1. Fetch the Estimate - this is the source of truth for services and parts
    const estimate = await Estimate.findOne({ _id: estimateId, tenantId }).lean<IEstimate>();

    if (!estimate) {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }

    const { inspectionId, customerId, vehicleId } = estimate;

    if (!inspectionId) {
      return NextResponse.json({ error: 'Estimate is not linked to an inspection' }, { status: 400 });
    }

    // 2. Fetch the original inspection to get the parent job card
    const inspection = await VehicleInspection.findOne({ _id: inspectionId, tenantId })
      .populate('jobCardId', 'jobCardNumber')
      .lean();
    
    if (!inspection || !inspection.jobCardId) {
        return NextResponse.json({ error: 'Original inspection or its job card not found' }, { status: 404 });
    }
    const parentJobCard = inspection.jobCardId as any; // Cast to any to access jobCardNumber

    // 3. Map services and parts from the estimate to the format required by the JobCard model
    const servicesForJobCard = (estimate.services || []).map(s => ({
        serviceId: s.serviceId,
        quantity: s.quantity || 1,
        laborHours: s.laborHours,
        laborRate: s.laborRate,
    }));

    const partsForJobCard = (estimate.parts || []).map(p => ({
        partId: p.partId,
        quantity: p.quantity || 1,
        cost: p.unitCost, // In Estimate it's unitCost, in JobCard it's cost
    }));

    // 4. Find the inspection invoice to get the fee for deduction
    let inspectionFeeDeducted = 0;
    const inspectionInvoice = await Invoice.findOne({ inspectionId: inspection._id, tenantId, isInspectionInvoice: true }).lean<IInvoice>();
    if (inspectionInvoice) {
        inspectionFeeDeducted = inspectionInvoice.totalAmount;
    } else {
        inspectionFeeDeducted = INSPECTION_CONFIG.DEFAULT_FEE;
    }

    // 5. Create the new 'repair' Job Card
    const jobCardNumber = await JobCard.getNextJobCardNumber(tenantId);

    const newJobCard = new JobCard({
      tenantId,
      jobCardNumber,
      customerId: customerId,
      vehicleId: vehicleId,
      type: 'repair',
      status: 'pending',
      priority: 'medium',
      parentJobCardId: parentJobCard._id,
      inspectionId: inspection._id,
      services: servicesForJobCard,
      partsUsed: partsForJobCard,
      notes: `This repair job card was generated from estimate #${estimate.estimateNumber} (related to inspection #${parentJobCard.jobCardNumber}).`,
      inspectionFeeDeducted: inspectionFeeDeducted,
    });

    await newJobCard.save();

    // 6. Update the estimate status to 'approved'
    await Estimate.findOneAndUpdate({ _id: estimateId, tenantId }, { status: 'approved' });

    const populatedJobCard = await JobCard.findById(newJobCard._id)
        .populate('customerId', 'firstName lastName')
        .populate('vehicleId', 'make model year')
        .lean();

    return NextResponse.json({
      success: true,
      message: 'Repair job card created successfully from estimate.',
      jobCard: populatedJobCard,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating job card from estimate:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create job card from estimate', details: errorMessage }, { status: 500 });
  }
}

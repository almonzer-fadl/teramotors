import { connectToDatabase } from '@/lib/db'
import Estimate from '@/lib/models/Estimate'
import JobCard from '@/lib/models/JobCard'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import Mechanic from '@/lib/models/Mechanic'
import User from '@/lib/models/User'
import Service from '@/lib/models/Service'
import { getServerSession } from "@/lib/auth-server";
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return Response.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get total count for pagination
    const totalCount = await Estimate.countDocuments({});
    
    const estimates = await Estimate.find({})
      .populate('jobCardId', '_id')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate({        path: 'mechanicId',        populate: {          path: 'userId',          select: 'firstName lastName'        }      })
      .populate('services.serviceId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return Response.json({
      estimates,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('Error fetching estimates:', error)
    // Return empty array when database is unavailable
    return Response.json({
      estimates: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
      }
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return Response.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    await connectToDatabase()
    
    const body = await request.json()
    
    // Validate that job card exists (optional)
    if (body.jobCardId) {
      const jobCard = await JobCard.findById(body.jobCardId)
      if (!jobCard) {
        return Response.json({ error: 'Job card not found' }, { status: 400 })
      }
    }

    // Validate that customer exists
    const customer = await Customer.findById(body.customerId)
    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 400 })
    }

    // Validate that vehicle exists
    const vehicle = await Vehicle.findById(body.vehicleId)
    if (!vehicle) {
      return Response.json({ error: 'Vehicle not found' }, { status: 400 })
    }

    // Validate that mechanic exists (optional)
    if (body.mechanicId) {
      const mechanic = await User.findById(body.mechanicId)
      if (!mechanic) {
        return Response.json({ error: 'Mechanic not found' }, { status: 400 })
      }
    }

    // Clean and validate services
    const cleanedServices = (Array.isArray(body.services) ? body.services : []).map((service: any) => {
      const quantity = Number(service.quantity ?? 1) || 1
      const laborHours = Number(service.laborHours ?? 0) || 0
      const laborRate = Number(service.laborRate ?? 0) || 0
      const laborCost = Number(service.laborCost ?? laborHours * laborRate) || 0
      const partsCost = Number(service.partsCost ?? 0) || 0
      const computedTotal = Number(service.totalCost ?? (quantity * (laborCost + partsCost))) || 0

      return {
        ...service,
        serviceId: service.serviceId && service.serviceId !== '' && !String(service.serviceId).startsWith('auto-') ? service.serviceId : null,
        quantity,
        laborHours,
        laborRate,
        laborCost,
        partsCost,
        totalCost: computedTotal,
        name: service.name ?? '',
        description: service.description ?? service.name ?? ''
      }
    });

    // Validate services (only if serviceId is provided)
    for (const service of cleanedServices) {
      if (service.serviceId) {
        const serviceExists = await Service.findById(service.serviceId)
        if (!serviceExists) {
          return Response.json({ error: `Service ${service.serviceId} not found` }, { status: 400 })
        }
      }
    }

    // Clean parts
    const cleanedParts = (Array.isArray(body.parts) ? body.parts : []).map((part: any) => {
      const quantity = Number(part.quantity ?? 1) || 1
      // Accept both `unitCost` and legacy `cost`
      const unitCost = Number(part.unitCost ?? part.cost ?? 0) || 0
      const computedTotal = Number(part.totalCost ?? (quantity * unitCost)) || 0

      return {
        ...part,
        partId: part.partId && part.partId !== '' ? part.partId : null,
        name: part.name ?? '',
        quantity,
        unitCost,
        totalCost: computedTotal
      }
    });


    // Calculate totals
    const servicesTotal = cleanedServices.reduce((sum: number, service: any) => sum + (Number(service.totalCost) || 0), 0)
    const partsTotal = cleanedParts.reduce((sum: number, part: any) => sum + (Number(part.totalCost) || 0), 0)
    const subtotal = servicesTotal + partsTotal
    const tax = partsTotal * 0.15 // 15% tax rate ONLY on parts
    const total = subtotal + tax

    // Set valid until date (30 days from now)
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30)


    const estimate = new Estimate({
      jobCardId: body.jobCardId || null,
      inspectionId: body.inspectionId || null,
      customerId: body.customerId,
      vehicleId: body.vehicleId,
      mechanicId: body.mechanicId || null,
      status: body.status || 'pending',
      services: cleanedServices || [],
      parts: cleanedParts || [],
      subtotal,
      tax,
      total,
      validUntil: body.validUntil ? new Date(body.validUntil) : validUntil,
      notes: body.notes || ''
    })

    await estimate.save()

    const populatedEstimate = await Estimate.findById(estimate._id)
      .populate('jobCardId', '_id')
      .populate('inspectionId', 'inspectionDate overallCondition')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'firstName lastName displayName')
      .populate('services.serviceId', 'name')
      .populate('parts.partId', 'name partNumber')

    return Response.json({ 
      success: true, 
      estimate: populatedEstimate
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating estimate:', error)
    return Response.json({ 
      error: 'Failed to create estimate',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

import { connectToDatabase } from '@/lib/db'
import VehicleInspection from '@/lib/models/VehicleInspection'
import InspectionTemplate from '@/lib/models/InspectionTemplate'
import Vehicle from '@/lib/models/Vehicle'
import Customer from '@/lib/models/Customer'
import Mechanic from '@/lib/models/Mechanic'
import User from '@/lib/models/User'
import { getServerSession } from "@/lib/auth-server";
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
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
    const totalCount = await VehicleInspection.countDocuments({});
    
    const inspections = await VehicleInspection.find({})
      .populate('vehicleId', 'make model year licensePlate')
      .populate('customerId', 'firstName lastName')
      .populate({        path: 'mechanicId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('templateId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return Response.json({
      inspections,
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
    console.error('Error fetching inspections:', error)
    // Return empty array when database is unavailable
    return Response.json({
      inspections: [],
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

    await connectToDatabase()
    
    const body = await request.json()
    
    // Validate that vehicle exists
    const vehicle = await Vehicle.findById(body.vehicleId)
    if (!vehicle) {
      return Response.json({ error: 'Vehicle not found' }, { status: 400 })
    }

    // Validate that customer exists
    const customer = await Customer.findById(body.customerId)
    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 400 })
    }

    // Validate that mechanic exists
    const mechanic = await Mechanic.findById(body.mechanicId)
    if (!mechanic) {
      return Response.json({ error: 'Mechanic not found' }, { status: 400 })
    }

    // Validate that template exists
    const template = await InspectionTemplate.findById(body.templateId)
    if (!template) {
      return Response.json({ error: 'Inspection template not found' }, { status: 400 })
    }

    // Calculate total estimated cost
    const totalEstimatedCost = body.items.reduce((sum: number, item: any) => sum + (item.estimatedCost || 0), 0)

    const inspection = new VehicleInspection({
      vehicleId: body.vehicleId,
      customerId: body.customerId,
      mechanicId: body.mechanicId,
      templateId: body.templateId,
      inspectionDate: body.inspectionDate,
      mileage: body.mileage,
      overallCondition: body.overallCondition,
      items: body.items,
      totalEstimatedCost,
      recommendations: body.recommendations,
      nextInspectionDate: body.nextInspectionDate,
      status: body.status || 'in-progress'
    })

    await inspection.save()

    const populatedInspection = await VehicleInspection.findById(inspection._id)
      .populate('vehicleId', 'make model year licensePlate')
      .populate('customerId', 'firstName lastName')
      .populate({        path: 'mechanicId',        populate: {          path: 'userId',          select: 'firstName lastName'        }      })
      .populate('templateId', 'name')

    return Response.json({ 
      success: true, 
      inspection: populatedInspection
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating inspection:', error)
    return Response.json({ error: 'Failed to create inspection' }, { status: 500 })
  }
}

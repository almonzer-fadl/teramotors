import { connectToDatabase } from '@/lib/db'
import VehicleInspection from '@/lib/models/VehicleInspection'
import InspectionTemplate from '@/lib/models/InspectionTemplate'
import Vehicle from '@/lib/models/Vehicle'
import Customer from '@/lib/models/Customer'
import User from '@/lib/models/User'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const inspections = await VehicleInspection.find({})
      .populate('vehicleId', 'make model year licensePlate')
      .populate('customerId', 'firstName lastName')
      .populate('mechanicId', 'fullName')
      .populate('templateId', 'name')
      .sort({ createdAt: -1 })

    return Response.json(inspections)
  } catch (error) {
    console.error('Error fetching inspections:', error)
    // Return empty array when database is unavailable
    return Response.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
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
    const mechanic = await User.findById(body.mechanicId)
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
      .populate('mechanicId', 'fullName')
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

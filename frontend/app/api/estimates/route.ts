import { connectToDatabase } from '@/lib/db'
import Estimate from '@/lib/models/Estimate'
import JobCard from '@/lib/models/JobCard'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import User from '@/lib/models/User'
import Service from '@/lib/models/Service'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const estimates = await Estimate.find({})
      .populate('jobCardId', '_id')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'fullName')
      .populate('services.serviceId', 'name')
      .sort({ createdAt: -1 })

    return Response.json(estimates)
  } catch (error) {
    console.error('Error fetching estimates:', error)
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
    
    // Validate that job card exists
    const jobCard = await JobCard.findById(body.jobCardId)
    if (!jobCard) {
      return Response.json({ error: 'Job card not found' }, { status: 400 })
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

    // Validate that mechanic exists
    const mechanic = await User.findById(body.mechanicId)
    if (!mechanic) {
      return Response.json({ error: 'Mechanic not found' }, { status: 400 })
    }

    // Validate services
    for (const service of body.services) {
      const serviceExists = await Service.findById(service.serviceId)
      if (!serviceExists) {
        return Response.json({ error: `Service ${service.serviceId} not found` }, { status: 400 })
      }
    }

    // Calculate totals
    const subtotal = body.services.reduce((sum: number, service: any) => sum + service.totalCost, 0)
    const tax = subtotal * 0.08 // 8% tax rate
    const total = subtotal + tax

    // Set valid until date (30 days from now)
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30)

    const estimate = new Estimate({
      jobCardId: body.jobCardId,
      customerId: body.customerId,
      vehicleId: body.vehicleId,
      mechanicId: body.mechanicId,
      status: body.status || 'pending',
      services: body.services,
      subtotal,
      tax,
      total,
      validUntil,
      notes: body.notes
    })

    await estimate.save()

    const populatedEstimate = await Estimate.findById(estimate._id)
      .populate('jobCardId', '_id')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'fullName')
      .populate('services.serviceId', 'name')

    return Response.json({ 
      success: true, 
      estimate: populatedEstimate
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating estimate:', error)
    return Response.json({ error: 'Failed to create estimate' }, { status: 500 })
  }
}

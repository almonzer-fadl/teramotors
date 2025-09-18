import { connectToDatabase } from '@/lib/db'
import JobCard from '@/lib/models/JobCard'
import Appointment from '@/lib/models/Appointment'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import User from '@/lib/models/User'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const jobCards = await JobCard.find({})
      .populate('appointmentId', 'appointmentDate startTime endTime')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'fullName')
      .sort({ createdAt: -1 })

    return Response.json(jobCards)
  } catch (error) {
    console.error('Error fetching job cards:', error)
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
    
    // Validate that appointment exists
    const appointment = await Appointment.findById(body.appointmentId)
    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 400 })
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

    const jobCard = new JobCard({
      appointmentId: body.appointmentId,
      customerId: body.customerId,
      vehicleId: body.vehicleId,
      mechanicId: body.mechanicId,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      estimatedStartTime: body.estimatedStartTime,
      estimatedEndTime: body.estimatedEndTime,
      laborHours: body.laborHours,
      partsUsed: body.partsUsed || [],
      notes: body.notes
    })

    await jobCard.save()

    // Update appointment status to in-progress
    await Appointment.findByIdAndUpdate(body.appointmentId, {
      status: 'in-progress'
    })

    const populatedJobCard = await JobCard.findById(jobCard._id)
      .populate('appointmentId', 'appointmentDate startTime endTime')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'fullName')

    return Response.json({ 
      success: true, 
      jobCard: populatedJobCard
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job card:', error)
    return Response.json({ error: 'Failed to create job card' }, { status: 500 })
  }
}

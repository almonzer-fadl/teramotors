import { connectToDatabase } from '@/lib/db'
import Appointment from '@/lib/models/Appointment'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import User from '@/lib/models/User'
import Service from '@/lib/models/Service'
import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let query: any = {}

    if (status) {
      query.status = status
    }

    if (dateFrom && dateTo) {
      query.appointmentDate = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      }
    } else if (dateFrom) {
      query.appointmentDate = { $gte: new Date(dateFrom) }
    } else if (dateTo) {
      query.appointmentDate = { $lte: new Date(dateTo) }
    }
    
    const appointments = await Appointment.find(query)
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'fullName')
      .populate('serviceId', 'name')
      .sort({ appointmentDate: 1, startTime: 1 })

    return Response.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
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

    // Validate that service exists
    const service = await Service.findById(body.serviceId)
    if (!service) {
      return Response.json({ error: 'Service not found' }, { status: 400 })
    }

    // Check for time conflicts
    const conflictingAppointment = await Appointment.findOne({
      mechanicId: body.mechanicId,
      appointmentDate: body.appointmentDate,
      status: { $in: ['scheduled', 'in-progress'] },
      $or: [
        {
          startTime: { $lt: body.endTime },
          endTime: { $gt: body.startTime }
        }
      ]
    })

    if (conflictingAppointment) {
      return Response.json({ 
        error: 'Time conflict: Mechanic already has an appointment during this time' 
      }, { status: 400 })
    }

    const appointment = new Appointment({
      customerId: body.customerId,
      vehicleId: body.vehicleId,
      mechanicId: body.mechanicId,
      serviceId: body.serviceId,
      appointmentDate: body.appointmentDate,
      startTime: body.startTime,
      endTime: body.endTime,
      status: body.status || 'scheduled',
      priority: body.priority || 'medium',
      notes: body.notes,
      estimatedCost: body.estimatedCost
    })

    await appointment.save()

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'fullName')
      .populate('serviceId', 'name')

    return Response.json({ 
      success: true, 
      appointment: populatedAppointment
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return Response.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}

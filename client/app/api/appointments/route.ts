import { connectToDatabase } from '@/lib/db'
import Appointment from '@/lib/models/Appointment'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import Mechanic from '@/lib/models/Mechanic'
import User from '@/lib/models/User'
import Service from '@/lib/models/Service'
import { getServerSession } from "@/lib/auth-server";
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'appointmentDate'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const query: any = {}

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

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build sort object
    const sort: any = {}
    if (sortBy === 'appointmentDate') {
      sort.appointmentDate = sortOrder === 'desc' ? -1 : 1
      sort.startTime = sortOrder === 'desc' ? -1 : 1
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1
    }
    
    // Get total count for pagination
    const totalCount = await Appointment.countDocuments(query)
    
    const appointments = await Appointment.find(query)
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate({
        path: 'mechanicId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('serviceId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return Response.json({
      appointments,
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
    console.error('Error fetching appointments:', error)
    // Return empty array when database is unavailable
    return Response.json({
      appointments: [],
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
    const mechanic = await Mechanic.findById(body.mechanicId)
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
      .populate({        path: 'mechanicId',        populate: {          path: 'userId',          select: 'firstName lastName'        }      })
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

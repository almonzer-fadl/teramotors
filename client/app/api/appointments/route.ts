import { connectToDatabase } from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import Customer from '@/lib/models/Customer';
import Vehicle from '@/lib/models/Vehicle';
import Mechanic from '@/lib/models/Mechanic';
import Service from '@/lib/models/Service';
import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/appointments - List appointments for tenant
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'appointmentDate';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build query with tenant filter
    const query: Record<string, unknown> = { tenantId };

    if (status) {
      query.status = status;
    }

    if (dateFrom && dateTo) {
      query.appointmentDate = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    } else if (dateFrom) {
      query.appointmentDate = { $gte: new Date(dateFrom) };
    } else if (dateTo) {
      query.appointmentDate = { $lte: new Date(dateTo) };
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {};

    if (sortBy === 'appointmentDate') {
      sort.appointmentDate = sortOrder === 'desc' ? -1 : 1;
      sort.startTime = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const totalCount = await Appointment.countDocuments(query);

    const appointments = await Appointment.find(query)
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate({
        path: 'mechanicId',
        populate: {
          path: 'userId',
          select: 'firstName lastName',
        },
      })
      .populate('serviceId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      appointments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  },
  { requireTenant: true }
);

// POST /api/appointments - Create appointment for tenant
export const POST = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const body = await req.json();

    // Validate customer belongs to tenant
    const customer = await Customer.findOne({
      _id: body.customerId,
      tenantId,
    });
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 400 }
      );
    }

    // Validate vehicle belongs to tenant
    const vehicle = await Vehicle.findOne({
      _id: body.vehicleId,
      tenantId,
    });
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 400 }
      );
    }

    // Validate mechanic exists
    const mechanic = await Mechanic.findById(body.mechanicId);
    if (!mechanic) {
      return NextResponse.json(
        { error: 'Mechanic not found' },
        { status: 400 }
      );
    }

    // Validate service belongs to tenant
    const service = await Service.findOne({
      _id: body.serviceId,
      tenantId,
    });
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 400 }
      );
    }

    // Check for time conflicts within tenant
    const conflictingAppointment = await Appointment.findOne({
      tenantId,
      mechanicId: body.mechanicId,
      appointmentDate: body.appointmentDate,
      status: { $in: ['scheduled', 'in-progress'] },
      $or: [
        {
          startTime: { $lt: body.endTime },
          endTime: { $gt: body.startTime },
        },
      ],
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        {
          error:
            'Time conflict: Mechanic already has an appointment during this time',
        },
        { status: 400 }
      );
    }

    const appointment = new Appointment({
      tenantId, // Always set tenantId from auth context
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
      estimatedCost: body.estimatedCost,
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate({
        path: 'mechanicId',
        populate: {
          path: 'userId',
          select: 'firstName lastName',
        },
      })
      .populate('serviceId', 'name');

    return NextResponse.json(
      {
        success: true,
        appointment: populatedAppointment,
      },
      { status: 201 }
    );
  },
  { requireTenant: true }
);

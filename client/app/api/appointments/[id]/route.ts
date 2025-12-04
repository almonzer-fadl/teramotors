import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/appointments/[id] - Get single appointment
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    // Filter by BOTH id AND tenantId
    const appointment = await Appointment.findOne({
      _id: params?.id,
      tenantId,
    })
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

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  },
  { requireTenant: true }
);

// PUT /api/appointments/[id] - Update appointment
export const PUT = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    const body = await req.json();

    // Update only if belongs to tenant
    const appointment = await Appointment.findOneAndUpdate(
      { _id: params?.id, tenantId },
      body,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, appointment });
  },
  { requireTenant: true }
);

// DELETE /api/appointments/[id] - Delete appointment
export const DELETE = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    const appointment = await Appointment.findOneAndDelete({
      _id: params?.id,
      tenantId,
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Vehicle from '@/lib/models/Vehicle';
import Customer from '@/lib/models/Customer';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/vehicles/[id] - Get single vehicle
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    // Filter by BOTH id AND tenantId
    const vehicle = await Vehicle.findOne({
      _id: params?.id,
      tenantId,
    })
      .populate('customerId', 'firstName lastName isActive')
      .populate('serviceHistory.serviceId', 'name');

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle);
  },
  { requireTenant: true }
);

// PUT /api/vehicles/[id] - Update vehicle
export const PUT = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    const body = await req.json();

    // Update only if belongs to tenant
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: params?.id, tenantId },
      {
        vin: body.vin,
        make: body.make,
        model: body.model,
        year: body.year,
        color: body.color,
        licensePlate: body.licensePlate,
        mileage: body.mileage,
        engineType: body.engineType,
        transmission: body.transmission,
        fuelType: body.fuelType,
        photos: body.photos,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, vehicle });
  },
  { requireTenant: true }
);

// DELETE /api/vehicles/[id] - Delete vehicle
export const DELETE = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    // First get the vehicle to find its customer
    const vehicle = await Vehicle.findOne({
      _id: params?.id,
      tenantId,
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Remove vehicle from customer's vehicles array
    await Customer.findOneAndUpdate(
      { _id: vehicle.customerId, tenantId },
      { $pull: { vehicles: vehicle._id } }
    );

    // Delete the vehicle
    await Vehicle.findOneAndDelete({
      _id: params?.id,
      tenantId,
    });

    return NextResponse.json({ success: true });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

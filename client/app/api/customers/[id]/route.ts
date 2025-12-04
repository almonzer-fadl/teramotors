import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/lib/models/Customer';
import Vehicle from '@/lib/models/Vehicle';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/customers/[id] - Get single customer
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    // Filter by BOTH id AND tenantId for security
    const customer = await Customer.findOne({
      _id: params?.id,
      tenantId,
    }).populate('vehicles');

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  },
  { requireTenant: true }
);

// PUT /api/customers/[id] - Update customer
export const PUT = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    const body = await req.json();

    // Update only if belongs to tenant
    const customer = await Customer.findOneAndUpdate(
      { _id: params?.id, tenantId },
      {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        phoneNumber: body.phoneNumber,
        whatsappEnabled: body.whatsappEnabled,
        language: body.language,
        address: body.address,
        vatNumber: body.vatNumber,
        idNumber: body.idNumber,
        companyName: body.companyName,
        notes: body.notes,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, customer });
  },
  { requireTenant: true }
);

// DELETE /api/customers/[id] - Delete customer (admin only)
export const DELETE = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    // First verify customer belongs to tenant
    const customer = await Customer.findOne({
      _id: params?.id,
      tenantId,
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Delete vehicles belonging to this customer AND tenant
    await Vehicle.deleteMany({
      customerId: params?.id,
      tenantId,
    });

    // Delete the customer
    await Customer.findOneAndDelete({
      _id: params?.id,
      tenantId,
    });

    return NextResponse.json({ success: true });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import Tenant from '@/lib/models/Tenant';
import { connectToDatabase } from '@/lib/db';

export const GET = withTenantAuth(
  async (_req: NextRequest, { params }) => {
    await connectToDatabase();
    const tenant = await Tenant.findById(params?.id);

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tenant });
  },
  { requireTenant: false, allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

export const PUT = withTenantAuth(
  async (req: NextRequest, { params }) => {
    await connectToDatabase();
    const data = await req.json();

    const tenant = await Tenant.findByIdAndUpdate(
      params?.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tenant });
  },
  { requireTenant: false, allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

export const DELETE = withTenantAuth(
  async (_req: NextRequest, { params }) => {
    await connectToDatabase();

    const tenant = await Tenant.findByIdAndUpdate(
      params?.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Tenant cancelled successfully' });
  },
  { requireTenant: false, allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

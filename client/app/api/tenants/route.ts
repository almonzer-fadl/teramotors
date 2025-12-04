import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import Tenant from '@/lib/models/Tenant';
import { createTenant, generateSlug } from '@/lib/tenant-utils';
import { connectToDatabase } from '@/lib/db';

export const GET = withTenantAuth(
  async (_req: NextRequest) => {
    await connectToDatabase();

    const tenants = await Tenant.find().select('-__v').sort({ createdAt: -1 });
    return NextResponse.json({ tenants });
  },
  { requireTenant: false, allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

export const POST = withTenantAuth(
  async (req: NextRequest, { session }) => {
    await connectToDatabase();
    const data = await req.json();
    const { name, companyInfo } = data;

    if (!name || !companyInfo?.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let slug = generateSlug(name);
    const existing = await Tenant.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const tenant = await createTenant({
      name,
      slug,
      companyInfo,
      createdBy: session.user.id,
    });

    return NextResponse.json({ tenant }, { status: 201 });
  },
  { requireTenant: false, allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

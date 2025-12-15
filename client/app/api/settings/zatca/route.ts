import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';

// GET /api/settings/zatca
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();
    try {
      const tenant = await Tenant.findById(tenantId).select('zatcaConfig').lean();
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
      return NextResponse.json(tenant.zatcaConfig || {});
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

// PUT /api/settings/zatca
export const PUT = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();
    try {
        const body = await req.json();
        
        const updateData: { [key: string]: any } = {};
        for (const key in body) {
            updateData[`zatcaConfig.${key}`] = body[key];
        }

        const updatedTenant = await Tenant.findByIdAndUpdate(
            tenantId,
            { $set: updateData },
            { new: true, runValidators: true, lean: true }
        ).select('zatcaConfig');
        
        if (!updatedTenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedTenant.zatcaConfig);

    } catch (error) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

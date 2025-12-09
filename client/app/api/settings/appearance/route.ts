import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';

// GET /api/settings/appearance
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();
    try {
      const tenant = await Tenant.findById(tenantId).select('settings.theme').lean();
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
      return NextResponse.json({ theme: tenant.settings?.theme || 'default' });
    } catch (error) {
      console.error('Error fetching appearance settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] } // Only admins can GET tenant theme
);

// PUT /api/settings/appearance
export const PUT = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();
    try {
        const body = await req.json();
        const { theme } = body;

        if (!theme) {
            return NextResponse.json({ error: 'Theme name is required.' }, { status: 400 });
        }

        const updatedTenant = await Tenant.findByIdAndUpdate(
            tenantId,
            { $set: { 'settings.theme': theme } },
            { new: true, runValidators: true, lean: true }
        ).select('settings.theme');
        
        if (!updatedTenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        
        return NextResponse.json({ theme: updatedTenant.settings?.theme });

    } catch (error) {
      console.error('Error updating appearance settings:', error);
      return NextResponse.json({ error: 'Failed to update appearance settings' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] } // Only admins can PUT tenant theme
);

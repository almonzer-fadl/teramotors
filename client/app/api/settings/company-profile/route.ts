import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';

// GET /api/settings/company-profile
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    try {
      const tenant = await Tenant.findById(tenantId)
        .select('companyInfo branding')
        .lean();

      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }

      return NextResponse.json({
        companyInfo: tenant.companyInfo,
        branding: tenant.branding,
      });

    } catch (error) {
      console.error('Error fetching company profile:', error);
      return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

// PUT /api/settings/company-profile
export const PUT = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    try {
        const body = await req.json();
        
        const updateData: { [key: string]: any } = {};

        // Construct dot notation for nested updates
        if(body.companyInfo) {
            for (const key in body.companyInfo) {
                if(key === 'address') {
                     for (const addrKey in body.companyInfo.address) {
                        updateData[`companyInfo.address.${addrKey}`] = body.companyInfo.address[addrKey];
                    }
                } else {
                    updateData[`companyInfo.${key}`] = body.companyInfo[key];
                }
            }
        }

        if(body.branding) {
             for (const key in body.branding) {
                updateData[`branding.${key}`] = body.branding[key];
            }
        }
        
        const updatedTenant = await Tenant.findByIdAndUpdate(
            tenantId,
            { $set: updateData },
            { new: true, runValidators: true, lean: true }
        ).select('companyInfo branding');
        
        if (!updatedTenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedTenant);

    } catch (error) {
      console.error('Error updating company profile:', error);
      if((error as any).name === 'ValidationError') {
           return NextResponse.json({ error: (error as any).message }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to update company profile' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

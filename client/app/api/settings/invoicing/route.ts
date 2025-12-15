import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';

// GET /api/settings/invoicing
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();
    try {
      const tenant = await Tenant.findById(tenantId).select('settings').lean();
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
      return NextResponse.json(tenant.settings || {});
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

// PUT /api/settings/invoicing
export const PUT = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();
    try {
        const body = await req.json();
        const { invoicePrefix, estimatePrefix, defaultPaymentTerms, defaultInvoiceNotes } = body;
        
        const updateData: { [key: string]: any } = {};
        if (invoicePrefix) updateData['settings.invoicePrefix'] = invoicePrefix;
        if (estimatePrefix) updateData['settings.estimatePrefix'] = estimatePrefix;
        if (defaultPaymentTerms) updateData['settings.defaultPaymentTerms'] = defaultPaymentTerms;
        if (defaultInvoiceNotes) updateData['settings.defaultInvoiceNotes'] = defaultInvoiceNotes;

        const updatedTenant = await Tenant.findByIdAndUpdate(
            tenantId,
            { $set: updateData },
            { new: true, runValidators: true, lean: true }
        ).select('settings');
        
        if (!updatedTenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedTenant.settings);

    } catch (error) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';

// PUT /api/onboarding/status - Update onboarding step or completion status
export const PUT = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();
    try {
        const body = await req.json();
        const { step, completed } = body;

        const updateData: { [key: string]: any } = {};

        if (step) {
            updateData['settings.onboardingState.step'] = step;
        }
        if (completed !== undefined) {
            updateData['settings.onboardingState.completed'] = completed;
        }
        
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'Either step or completed status is required.' }, { status: 400 });
        }

        const updatedTenant = await Tenant.findByIdAndUpdate(
            tenantId,
            { $set: updateData },
            { new: true, runValidators: true, lean: true }
        ).select('settings.onboardingState');
        
        if (!updatedTenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedTenant.settings?.onboardingState);

    } catch (error) {
      console.error('Error updating onboarding status:', error);
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
  },
  { requireTenant: true } // Any authenticated user of the tenant can update this
);

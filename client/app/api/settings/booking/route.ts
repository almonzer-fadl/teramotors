import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// PUT /api/settings/booking
// Update tenant booking settings
export const PUT = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    try {
      await connectToDatabase();

      const body = await req.json();
      const { bookingSettings } = body;

      if (!bookingSettings) {
        return NextResponse.json(
          { error: 'Booking settings are required' },
          { status: 400 }
        );
      }

      // Update tenant booking settings
      const tenant = await Tenant.findByIdAndUpdate(
        tenantId,
        { $set: { bookingSettings } },
        { new: true, runValidators: true }
      );

      if (!tenant) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        bookingSettings: tenant.bookingSettings,
      });
    } catch (error) {
      console.error('Error updating booking settings:', error);
      return NextResponse.json(
        { error: 'Failed to update booking settings' },
        { status: 500 }
      );
    }
  },
  { requireTenant: true }
);

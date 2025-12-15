import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';
import Service from '@/lib/models/Service';

// GET /api/public/tenants/[slug]/booking-info
// Get tenant booking configuration and available services
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();

    const { slug } = params;

    // Find tenant by slug
    const tenant = await Tenant.findOne({ slug, status: 'active' }).select(
      'name companyInfo bookingSettings branding'
    );

    if (!tenant) {
      return NextResponse.json(
        { error: 'Shop not found or booking is not available' },
        { status: 404 }
      );
    }

    // Check if booking is enabled
    if (!tenant.bookingSettings?.enabled) {
      return NextResponse.json(
        { error: 'Online booking is not enabled for this shop' },
        { status: 403 }
      );
    }

    // Get active services that are enabled for booking
    const services = await Service.find({
      tenantId: tenant._id,
      isActive: true,
      bookingEnabled: true,
    }).select('name description category laborRate estimatedDuration');

    return NextResponse.json({
      tenant: {
        name: tenant.name,
        companyInfo: {
          name: tenant.companyInfo.name,
          nameAr: tenant.companyInfo.nameAr,
          address: tenant.companyInfo.address,
          phone: tenant.companyInfo.phone,
        },
        branding: tenant.branding,
      },
      bookingSettings: {
        workingHours: tenant.bookingSettings.workingHours,
        appointmentDuration: tenant.bookingSettings.appointmentDuration,
        advanceBookingDays: tenant.bookingSettings.advanceBookingDays,
        requireApproval: tenant.bookingSettings.requireApproval,
      },
      services,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch booking information' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';
import { SlotCalculator } from '@/lib/services/SlotCalculator';

// GET /api/public/tenants/[slug]/available-slots?date=2024-12-07
// Get available appointment slots for a specific date
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();

    const { slug } = params;
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Find tenant by slug
    const tenant = await Tenant.findOne({ slug, status: 'active' });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Check if booking is enabled
    if (!tenant.bookingSettings?.enabled) {
      return NextResponse.json(
        { error: 'Online booking is not enabled' },
        { status: 403 }
      );
    }

    const requestedDate = new Date(dateParam);

    // Validate date is bookable
    if (!SlotCalculator.isDateBookable(
      requestedDate,
      tenant.bookingSettings.advanceBookingDays
    )) {
      return NextResponse.json(
        { error: 'Date is outside the bookable range' },
        { status: 400 }
      );
    }

    // Get available slots
    const slots = await SlotCalculator.getAvailableSlots(
      tenant._id,
      requestedDate,
      tenant.bookingSettings
    );

    return NextResponse.json({
      date: dateParam,
      slots,
      totalSlots: slots.length,
      availableSlots: slots.filter(s => s.available).length,
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}

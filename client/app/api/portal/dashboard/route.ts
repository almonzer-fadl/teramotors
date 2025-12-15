import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/lib/models/Customer';
import Tenant from '@/lib/models/Tenant';
import Vehicle from '@/lib/models/Vehicle';
import Appointment from '@/lib/models/Appointment';
import Service from '@/lib/models/Service';
import { CustomerPortalAuth } from '@/lib/services/CustomerPortalAuth';

export const dynamic = 'force-dynamic';

// Customer Portal Dashboard API
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get tenant slug from query params
    const tenantSlug = req.nextUrl.searchParams.get('tenantSlug');
    if (!tenantSlug) {
      return NextResponse.json(
        { error: 'Tenant slug is required' },
        { status: 400 }
      );
    }

    // Get customer ID and session token from cookies
    const customerId = req.cookies.get('portal_customer_id')?.value;
    const sessionToken = req.cookies.get('portal_session_token')?.value;

    if (!customerId || !sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session
    const isValid = await CustomerPortalAuth.validateSession(customerId, sessionToken);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Get tenant
    const tenant = await Tenant.findOne({ slug: tenantSlug, status: 'active' });
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Get customer
    const customer = await Customer.findOne({
      _id: customerId,
      tenantId: tenant._id,
      isActive: true
    }).select('firstName lastName email phone');

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get customer's vehicles
    const vehicles = await Vehicle.find({
      customerId: customer._id,
      isActive: true
    })
      .select('make model year licensePlate vin')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get upcoming appointments (future appointments only)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ensure Service model is registered before populate
    Service.modelName;

    const upcomingAppointments = await Appointment.find({
      customerId: customer._id,
      scheduledDate: { $gte: today },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('serviceId', 'name')
      .populate('vehicleId', 'make model')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .limit(5)
      .lean();

    // Get appointment stats
    const totalAppointments = await Appointment.countDocuments({
      customerId: customer._id
    });

    const completedAppointments = await Appointment.countDocuments({
      customerId: customer._id,
      status: 'completed'
    });

    // Return dashboard data
    return NextResponse.json({
      customer: {
        _id: customer._id.toString(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone
      },
      upcomingAppointments: upcomingAppointments.map(apt => ({
        _id: String(apt._id),
        scheduledDate: apt.scheduledDate,
        scheduledTime: apt.scheduledTime,
        status: apt.status,
        serviceId: {
          name: apt.serviceId?.name || 'Unknown Service'
        },
        vehicleId: {
          make: apt.vehicleId?.make || 'Unknown',
          model: apt.vehicleId?.model || 'Vehicle'
        }
      })),
      vehicles: vehicles.map(v => ({
        _id: String(v._id),
        make: v.make,
        model: v.model,
        year: v.year,
        licensePlate: v.licensePlate,
        vin: v.vin
      })),
      stats: {
        totalAppointments,
        completedAppointments,
        totalVehicles: vehicles.length
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}

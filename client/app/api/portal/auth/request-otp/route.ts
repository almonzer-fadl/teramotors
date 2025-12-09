import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/lib/models/Customer';
import Tenant from '@/lib/models/Tenant';
import { CustomerPortalAuth } from '@/lib/services/CustomerPortalAuth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { email, tenantSlug } = await req.json();

    if (!email || !tenantSlug) {
      return NextResponse.json(
        { error: 'Email and tenant slug are required' },
        { status: 400 }
      );
    }

    // Find tenant
    const tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Check if tenant is active (if status field exists)
    if (tenant.status && tenant.status !== 'active') {
      return NextResponse.json(
        { error: 'Tenant is not active' },
        { status: 403 }
      );
    }

    // Find customer by email
    const customer = await Customer.findOne({
      tenantId: tenant._id,
      email: email.toLowerCase().trim(),
      isActive: true
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if portal access is enabled
    if (!customer.portalAccess?.enabled) {
      return NextResponse.json(
        { error: 'Portal access is not enabled for this account' },
        { status: 403 }
      );
    }

    // Generate OTP
    const otp = CustomerPortalAuth.generateOTP();

    // Save OTP to customer
    customer.portalAccess.otpSecret = otp;
    customer.portalAccess.otpCreatedAt = new Date();
    await customer.save();

    // Log OTP to console if email is not configured (for testing)
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key') {
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🔐 CUSTOMER PORTAL OTP (Email not configured)');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`Customer: ${customer.firstName} ${customer.lastName}`);
      console.log(`Email: ${customer.email}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Valid for: 10 minutes`);
      console.log('═══════════════════════════════════════════════════════\n');
    }

    // Send OTP via email
    try {
      await CustomerPortalAuth.sendOTP(customer, tenant, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email (continuing anyway):', emailError);
      // Continue anyway - OTP is saved to database and logged to console
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      customerId: customer._id.toString()
    });
  } catch (error: any) {
    console.error('Request OTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

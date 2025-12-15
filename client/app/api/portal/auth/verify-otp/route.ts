import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CustomerPortalAuth } from '@/lib/services/CustomerPortalAuth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { customerId, otp } = await req.json();

    if (!customerId || !otp) {
      return NextResponse.json(
        { error: 'Customer ID and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP and create session
    const result = await CustomerPortalAuth.verifyOTP(customerId, otp);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      expiresAt: result.expiresAt
    });

    response.cookies.set('portal_customer_id', customerId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    response.cookies.set('portal_session_token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CustomerPortalAuth } from '@/lib/services/CustomerPortalAuth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const customerId = req.cookies.get('portal_customer_id')?.value;

    if (customerId) {
      await CustomerPortalAuth.logout(customerId);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear cookies
    response.cookies.delete('portal_customer_id');
    response.cookies.delete('portal_session_token');

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to logout' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { CustomerPortalAuth } from '@/lib/services/CustomerPortalAuth';
import Customer from '@/lib/models/Customer';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const customerId = request.cookies.get('portal_customer_id')?.value;
    const sessionToken = request.cookies.get('portal_session_token')?.value;

    if (!customerId || !sessionToken) {
        return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    const isValid = await CustomerPortalAuth.validateSession(customerId, sessionToken);
    if (!isValid) {
        return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    await connectToDatabase();
    const customer = await Customer.findById(customerId).select('firstName lastName email phone').lean();

    return NextResponse.json({ 
        isAuthenticated: true,
        customer: {
            id: customerId,
            ...customer
        }
    });
  } catch (error) {
    console.error('Error fetching portal session:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 500 });
  }
}

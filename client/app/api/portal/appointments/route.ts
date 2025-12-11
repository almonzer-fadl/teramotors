import { NextRequest, NextResponse } from 'next/server';
import Appointment from '@/lib/models/Appointment';
import { connectToDatabase } from '@/lib/db';
import { CustomerPortalAuth } from '@/lib/services/CustomerPortalAuth';

export const dynamic = 'force-dynamic';

async function getAuthenticatedCustomer(request: NextRequest) {
    const customerId = request.cookies.get('portal_customer_id')?.value;
    const sessionToken = request.cookies.get('portal_session_token')?.value;

    if (!customerId || !sessionToken) {
        return null;
    }

    const isValid = await CustomerPortalAuth.validateSession(customerId, sessionToken);
    if (!isValid) {
        return null;
    }
    return customerId;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const customerId = await getAuthenticatedCustomer(request);
    if (!customerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointments = await Appointment.find({ customerId })
      .populate('serviceId', 'name')
      .populate('vehicleId', 'make model')
      .sort({ appointmentDate: -1 });
      
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

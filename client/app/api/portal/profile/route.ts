import { NextRequest, NextResponse } from 'next/server';
import Customer from '@/lib/models/Customer';
import { connectToDatabase } from '@/lib/db';
import * as z from 'zod';
import { CustomerPortalAuth } from '@/lib/services/CustomerPortalAuth';

export const dynamic = 'force-dynamic';

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10),
});

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

    const customer = await Customer.findById(customerId).select('-portalAccess -__v');
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();
    const customerId = await getAuthenticatedCustomer(request);
    if (!customerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { firstName, lastName, phone } = validation.data;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: { firstName, lastName, phone } },
      { new: true }
    ).select('-portalAccess -__v');

    if (!updatedCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

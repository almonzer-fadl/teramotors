import { NextRequest, NextResponse } from 'next/server';
import Vehicle from '@/lib/models/Vehicle';
import { connectToDatabase } from '@/lib/db';
import * as z from 'zod';
import { CustomerPortalAuth } from '@/lib/services/CustomerPortalAuth';
import Customer from '@/lib/models/Customer';

export const dynamic = 'force-dynamic';

const vehicleSchema = z.object({
  make: z.string().min(2),
  model: z.string().min(1),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const customerId = await getAuthenticatedCustomer(request);
        if (!customerId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vehicle = await Vehicle.findOne({ _id: params.id, customerId });
        if (!vehicle) {
            return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
        }

        const body = await request.json();
        const validation = vehicleSchema.safeParse(body);
    
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(params.id, validation.data, { new: true });

        return NextResponse.json(updatedVehicle);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const customerId = await getAuthenticatedCustomer(request);
        if (!customerId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vehicle = await Vehicle.findOne({ _id: params.id, customerId });
        if (!vehicle) {
            return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
        }

        await Vehicle.findByIdAndDelete(params.id);

        // Also remove from customer's vehicles array
        await Customer.findByIdAndUpdate(customerId, { $pull: { vehicles: params.id } });

        return NextResponse.json({ message: 'Vehicle deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

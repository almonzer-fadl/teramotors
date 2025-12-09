import { NextRequest, NextResponse } from 'next/server';
import Vehicle from '@/lib/models/Vehicle';
import { connectToDatabase } from '@/lib/db';
import * as z from 'zod';
import { CustomerPortalAuth } from '@/lib/services/CustomerPortalAuth';
import Customer from '@/lib/models/Customer';

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

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const customerId = await getAuthenticatedCustomer(request);
    if (!customerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicles = await Vehicle.find({ customerId });
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    try {
      await connectToDatabase();
      const customerId = await getAuthenticatedCustomer(request);
      if (!customerId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const validation = vehicleSchema.safeParse(body);
  
      if (!validation.success) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
  
      const newVehicle = new Vehicle({
        ...validation.data,
        customerId,
        tenantId: customer.tenantId,
      });
  
      await newVehicle.save();
      
      // Also add vehicle to customer's list of vehicles
      customer.vehicles.push(newVehicle._id);
      await customer.save();

      return NextResponse.json(newVehicle, { status: 201 });
    } catch (error) {
      console.error('Error creating vehicle:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

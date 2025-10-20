import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Vehicle from '@/lib/models/Vehicle';
import { getServerSession } from "@/lib/auth-server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const vehicle = await Vehicle.findById(id)
      .populate('customerId', 'firstName lastName isActive')
      .populate('serviceHistory.serviceId', 'name');
    
    if (!vehicle) {
      return new Response(JSON.stringify({ error: 'Vehicle not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(vehicle));
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch vehicle' }), { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      {
        vin: body.vin,
        make: body.make,
        model: body.model,
        year: body.year,
        color: body.color,
        licensePlate: body.licensePlate,
        mileage: body.mileage,
        engineType: body.engineType,
        transmission: body.transmission,
        fuelType: body.fuelType,
        photos: body.photos,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!vehicle) {
      return new Response(JSON.stringify({ error: 'Vehicle not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, vehicle }));
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return new Response(JSON.stringify({ error: 'Failed to update vehicle' }), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const deleted = await Vehicle.findByIdAndDelete(id);

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Vehicle not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete vehicle' }), { status: 500 });
  }
}
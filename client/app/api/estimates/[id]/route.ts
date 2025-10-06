import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Estimate from '@/lib/models/Estimate';
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

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { status: 403 });
    }

    await connectToDatabase();
    
    const estimate = await Estimate.findById(id)
      .populate('customerId', 'firstName lastName email phone')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('services.serviceId', 'name');
    
    if (!estimate) {
      return new Response(JSON.stringify({ error: 'Estimate not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(estimate));
  } catch (error) {
    console.error('Error fetching estimate:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch estimate' }), { status: 500 });
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

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { status: 403 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    
    const estimate = await Estimate.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!estimate) {
      return new Response(JSON.stringify({ error: 'Estimate not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, estimate }));
  } catch (error) {
    console.error('Error updating estimate:', error);
    return new Response(JSON.stringify({ error: 'Failed to update estimate' }), { status: 500 });
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

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { status: 403 });
    }

    await connectToDatabase();
    
    const estimate = await Estimate.findByIdAndDelete(id);

    if (!estimate) {
      return new Response(JSON.stringify({ error: 'Estimate not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error deleting estimate:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete estimate' }), { status: 500 });
  }
}
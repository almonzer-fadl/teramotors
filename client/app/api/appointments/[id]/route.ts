import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import { getServerSession } from '@/lib/auth-server';

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
    
    const appointment = await Appointment.findById(id)
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate({        path: 'mechanicId',        populate: {          path: 'userId',          select: 'firstName lastName'        }      })
      .populate('serviceId', 'name');
    
    if (!appointment) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(appointment));
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch appointment' }), { status: 500 });
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
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!appointment) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, appointment }));
  } catch (error) {
    console.error('Error updating appointment:', error);
    return new Response(JSON.stringify({ error: 'Failed to update appointment' }), { status: 500 });
  }
}
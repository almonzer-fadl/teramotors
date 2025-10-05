import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Service from '@/lib/models/Service';
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
    
    const service = await Service.findById(id);
    
    if (!service) {
      return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(service));
  } catch (error) {
    console.error('Error fetching service:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch service' }), { status: 500 });
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
    
    const service = await Service.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!service) {
      return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, service }));
  } catch (error) {
    console.error('Error updating service:', error);
    return new Response(JSON.stringify({ error: 'Failed to update service' }), { status: 500 });
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
    
    // Perform soft deletion by setting isActive to false
    const service = await Service.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error deleting service:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete service' }), { status: 500 });
  }
}
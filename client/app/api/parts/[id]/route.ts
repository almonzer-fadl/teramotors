import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Part from '@/lib/models/Part';
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
    
    const part = await Part.findById(id);
    
    if (!part) {
      return new Response(JSON.stringify({ error: 'Part not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(part));
  } catch (error) {
    console.error('Error fetching part:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch part' }), { status: 500 });
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

    // Handle empty partNumber - remove it entirely if empty or null
    if (!body.partNumber || body.partNumber.trim() === '') {
      delete body.partNumber;
    }

    const part = await Part.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!part) {
      return new Response(JSON.stringify({ error: 'Part not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, part }));
  } catch (error) {
    console.error('Error updating part:', error);
    return new Response(JSON.stringify({ error: 'Failed to update part' }), { status: 500 });
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
    
    const part = await Part.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!part) {
      return new Response(JSON.stringify({ error: 'Part not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error deleting part:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete part' }), { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/lib/auth';
import JobCard from '@/lib/models/JobCard';
import Part from '@/lib/models/Part';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const { status } = await request.json();
    
    const updatedJobCard = await JobCard.findByIdAndUpdate(id, { status }, { new: true });

    if (status === 'completed') {
      for (const part of updatedJobCard.partsUsed) {
        await Part.findByIdAndUpdate(part.partId, { $inc: { stockQuantity: -part.quantity } });
      }
    }

    if (!updatedJobCard) {
      return new Response(JSON.stringify({ error: 'Job card not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, jobCard: updatedJobCard }));
  } catch (error) {
    console.error('Error updating job card status:', error);
    return new Response(JSON.stringify({ error: 'Failed to update job card status' }), { status: 500 });
  }
}
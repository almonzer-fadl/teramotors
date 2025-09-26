import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import JobCard from '@/lib/models/JobCard';
import { getServerSession } from "@/lib/auth-server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const { photos } = await request.json();
    
    const updatedJobCard = await JobCard.findByIdAndUpdate(id, { photos }, { new: true });

    if (!updatedJobCard) {
      return new Response(JSON.stringify({ error: 'Job card not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, jobCard: updatedJobCard }));
  } catch (error) {
    console.error('Error updating job card photos:', error);
    return new Response(JSON.stringify({ error: 'Failed to update job card photos' }), { status: 500 });
  }
}
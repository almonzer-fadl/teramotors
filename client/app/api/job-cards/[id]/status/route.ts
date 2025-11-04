import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from "@/lib/auth-server";
import JobCard from '@/lib/models/JobCard';
import Part from '@/lib/models/Part';
import { WhatsAppEventListeners } from '@/lib/services/WhatsAppEventListeners';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const { status } = await request.json();
    
    const updatedJobCard = await JobCard.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedJobCard) {
      return new Response(JSON.stringify({ error: 'Job card not found' }), { status: 404 });
    }

    if (status === 'completed') {
      // Decrement parts inventory
      for (const part of updatedJobCard.partsUsed) {
        await Part.findByIdAndUpdate(part.partId, { $inc: { stockQuantity: -part.quantity } });
      }

      // Send job completed WhatsApp message
      try {
        const whatsappListeners = WhatsAppEventListeners.getInstance();
        await whatsappListeners.onJobCardClosed(updatedJobCard.customerId.toString());
      } catch (whatsappError) {
        console.error('Error sending job completed WhatsApp message:', whatsappError);
        // Don't fail the status update if WhatsApp fails
      }
    }

    return new Response(JSON.stringify({ success: true, jobCard: updatedJobCard }));
  } catch (error) {
    console.error('Error updating job card status:', error);
    return new Response(JSON.stringify({ error: 'Failed to update job card status' }), { status: 500 });
  }
}
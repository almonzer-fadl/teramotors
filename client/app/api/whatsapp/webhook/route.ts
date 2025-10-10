import { NextRequest, NextResponse } from 'next/server';
import WhatsAppMessage from '@/lib/models/WhatsAppMessage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Twilio sends webhook data with message status updates
    const { MessageSid, MessageStatus, To, From } = body;

    if (!MessageSid || !MessageStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the message by Twilio message ID
    const message = await WhatsAppMessage.findOne({ twilioMessageId: MessageSid });

    if (!message) {
      console.log(`Message not found for Twilio ID: ${MessageSid}`);
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Update message status
    const updateData: any = {
      status: MessageStatus === 'delivered' ? 'delivered' : 'sent'
    };

    if (MessageStatus === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    await WhatsAppMessage.findByIdAndUpdate(message._id, updateData);

    console.log(`Updated message ${MessageSid} status to ${MessageStatus}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'WhatsApp webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}

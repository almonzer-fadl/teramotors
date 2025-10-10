import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { WhatsAppService } from '@/lib/services/WhatsAppService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId, messageType, language = 'ar', mediaUrl } = await request.json();

    if (!customerId || !messageType) {
      return NextResponse.json({ 
        error: 'Customer ID and message type are required' 
      }, { status: 400 });
    }

    const whatsappService = WhatsAppService.getInstance();
    const success = await whatsappService.sendMessage(
      customerId, 
      messageType, 
      language, 
      mediaUrl
    );

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'WhatsApp message sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send WhatsApp message' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

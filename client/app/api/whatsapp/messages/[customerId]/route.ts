import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { WhatsAppService } from '@/lib/services/WhatsAppService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId } = await params;
    const whatsappService = WhatsAppService.getInstance();
    const messages = await whatsappService.getCustomerMessages(customerId);

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Error getting customer messages:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

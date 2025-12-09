import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import WhatsAppMessage from '@/lib/models/WhatsAppMessage';

// GET /api/whatsapp/history - Get message history for the tenant
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();
    
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get('limit') || '50');

      const messages = await WhatsAppMessage.find({ tenantId })
        .sort({ sentAt: -1 })
        .limit(limit)
        .populate('customerId', 'firstName lastName')
        .lean();

      return NextResponse.json({ messages });

    } catch (error) {
      console.error('Error fetching WhatsApp history:', error);
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

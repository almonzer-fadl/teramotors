import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/lib/models/Customer';
import { WhatsAppService } from '@/lib/services/WhatsAppService';

// POST /api/whatsapp/send - Send a manual message
export const POST = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();
    
    try {
      const body = await req.json();
      const { customerId, messageBody } = body;

      if (!customerId || !messageBody) {
        return NextResponse.json({ error: 'customerId and messageBody are required.' }, { status: 400 });
      }

      const customer = await Customer.findOne({ _id: customerId, tenantId }).lean();
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found in your organization.' }, { status: 404 });
      }

      if (!customer.whatsappEnabled || !customer.phoneNumber) {
          return NextResponse.json({ error: 'This customer has not enabled WhatsApp notifications or has no phone number.' }, { status: 400 });
      }

      const result = await WhatsAppService.sendMessage(
        tenantId.toString(),
        customerId,
        customer.phoneNumber,
        messageBody
      );

      if (result.success) {
        return NextResponse.json({ success: true, message: 'Message sent successfully.' });
      } else {
        return NextResponse.json({ success: false, error: result.error || 'Failed to send message.' }, { status: 500 });
      }

    } catch (error) {
      console.error('Error sending manual WhatsApp message:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
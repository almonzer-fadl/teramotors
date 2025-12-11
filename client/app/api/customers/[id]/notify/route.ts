
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import Customer from '@/lib/models/Customer';
import { connectToDatabase } from '@/lib/db';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

export const POST = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'Customer ID is required' } },
        { status: 400 }
      );
    }
    await connectToDatabase();

    const customer = await Customer.findOne({ _id: id, tenantId });

    if (!customer) {
      return NextResponse.json({ success: false, error: { message: 'Customer not found' } }, { status: 404 });
    }

    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ success: false, error: { message: 'Subject and message are required' } }, { status: 400 });
    }

    await sendEmail({
      to: customer.email,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  }
);

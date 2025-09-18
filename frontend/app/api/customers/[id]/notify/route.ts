
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import Customer from '@/lib/models/Customer';
import { connectToDatabase } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const customer = await Customer.findById(params.id);

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
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: { message: 'Error sending email' } }, { status: 500 });
  }
}

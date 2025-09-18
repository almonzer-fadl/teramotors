
import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs';
import Appointment from '@/lib/models/Appointment';
import { connectToDatabase } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const tomorrow = dayjs().add(1, 'day');
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: tomorrow.startOf('day').toDate(),
        $lte: tomorrow.endOf('day').toDate(),
      },
      status: 'scheduled',
    }).populate('customerId', 'email firstName');

    for (const appointment of appointments) {
      if (appointment.customerId) {
        const customer = appointment.customerId as any;
        await sendEmail({
          to: customer.email,
          subject: 'Appointment Reminder',
          text: `Hi ${customer.firstName}, this is a reminder for your appointment tomorrow at ${appointment.startTime}.`,
          html: `<p>Hi ${customer.firstName},</p><p>This is a reminder for your appointment tomorrow at ${appointment.startTime}.</p>`,
        });
      }
    }

    return NextResponse.json({ success: true, message: `Sent ${appointments.length} reminders.` });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json({ success: false, error: { message: 'Error sending reminders' } }, { status: 500 });
  }
}

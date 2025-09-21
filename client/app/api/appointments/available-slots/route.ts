
import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs';
import Appointment from '@/lib/models/Appointment';
import { connectToDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const serviceDuration = Number(searchParams.get('duration')) || 60; // in minutes

    if (!date) {
      return NextResponse.json({ success: false, error: { message: 'Date is required' } }, { status: 400 });
    }

    const selectedDate = dayjs(date);
    const dayOfWeek = selectedDate.day();

    // Assuming business hours are 9 AM to 5 PM, Monday to Friday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json({ success: true, data: [] }); // Weekend
    }

    const businessHours = {
      start: selectedDate.hour(9).minute(0).second(0),
      end: selectedDate.hour(17).minute(0).second(0),
    };

    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: selectedDate.startOf('day').toDate(),
        $lte: selectedDate.endOf('day').toDate(),
      },
    });

    const slotDuration = 30; // 30-minute slots
    const availableSlots = [];

    let currentTime = businessHours.start;
    while (currentTime.isBefore(businessHours.end)) {
      const slotEndTime = currentTime.add(serviceDuration, 'minute');
      let isAvailable = true;

      if (slotEndTime.isAfter(businessHours.end)) {
        break;
      }

      for (const appointment of appointments) {
        const appointmentStart = dayjs(appointment.appointmentDate).hour(Number(appointment.startTime.split(':')[0])).minute(Number(appointment.startTime.split(':')[1]));
        const appointmentEnd = dayjs(appointment.appointmentDate).hour(Number(appointment.endTime.split(':')[0])).minute(Number(appointment.endTime.split(':')[1]));

        if (
          (currentTime.isAfter(appointmentStart) && currentTime.isBefore(appointmentEnd)) ||
          (slotEndTime.isAfter(appointmentStart) && slotEndTime.isBefore(appointmentEnd)) ||
          (currentTime.isSame(appointmentStart)) ||
          (slotEndTime.isSame(appointmentEnd))
        ) {
          isAvailable = false;
          break;
        }
      }

      if (isAvailable) {
        availableSlots.push(currentTime.format('HH:mm'));
      }

      currentTime = currentTime.add(slotDuration, 'minute');
    }

    return NextResponse.json({ success: true, data: availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json({ success: false, error: { message: 'Error fetching available slots' } }, { status: 500 });
  }
}

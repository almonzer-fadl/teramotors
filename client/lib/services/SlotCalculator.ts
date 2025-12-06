import { ITenant } from '@/lib/models/Tenant';
import Appointment from '@/lib/models/Appointment';
import mongoose from 'mongoose';

export interface TimeSlot {
  start: string; // ISO string
  end: string; // ISO string
  available: boolean;
}

export class SlotCalculator {
  /**
   * Calculate available appointment slots for a given date and tenant
   */
  static async getAvailableSlots(
    tenantId: mongoose.Types.ObjectId | string,
    date: Date,
    bookingSettings: ITenant['bookingSettings']
  ): Promise<TimeSlot[]> {
    if (!bookingSettings?.enabled) {
      return [];
    }

    const dayOfWeek = this.getDayName(date);
    const workingHours = bookingSettings.workingHours[dayOfWeek];

    // If the shop is closed on this day
    if (workingHours.closed) {
      return [];
    }

    // Generate all possible slots for the day
    const allSlots = this.generateSlots(
      date,
      workingHours.start,
      workingHours.end,
      bookingSettings.appointmentDuration,
      bookingSettings.bufferTime
    );

    // Get existing appointments for this day
    const existingAppointments = await Appointment.find({
      tenantId,
      appointmentDate: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      status: { $in: ['scheduled', 'in-progress'] },
    }).select('startTime endTime');

    // Mark slots as unavailable if they conflict with existing appointments
    const availableSlots = allSlots.map((slot) => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);

      const hasConflict = existingAppointments.some((apt) => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);

        // Check if times overlap
        return (
          (slotStart >= aptStart && slotStart < aptEnd) ||
          (slotEnd > aptStart && slotEnd <= aptEnd) ||
          (slotStart <= aptStart && slotEnd >= aptEnd)
        );
      });

      return {
        ...slot,
        available: !hasConflict,
      };
    });

    // Filter out past slots for today
    const now = new Date();
    return availableSlots.filter((slot) => new Date(slot.start) > now);
  }

  /**
   * Generate time slots for a given day
   */
  private static generateSlots(
    date: Date,
    startTime: string,
    endTime: string,
    duration: number,
    bufferTime: number
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const currentSlot = new Date(date);
    currentSlot.setHours(startHour, startMinute, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(endHour, endMinute, 0, 0);

    const totalSlotTime = duration + bufferTime;

    while (currentSlot < endOfDay) {
      const slotEnd = new Date(currentSlot.getTime() + duration * 60000);

      // Only add slot if it ends before the working day ends
      if (slotEnd <= endOfDay) {
        slots.push({
          start: currentSlot.toISOString(),
          end: slotEnd.toISOString(),
          available: true, // Will be updated based on existing appointments
        });
      }

      // Move to next slot (duration + buffer)
      currentSlot.setTime(currentSlot.getTime() + totalSlotTime * 60000);
    }

    return slots;
  }

  /**
   * Get day name from date
   */
  private static getDayName(date: Date): keyof ITenant['bookingSettings']['workingHours'] {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const;
    return days[date.getDay()];
  }

  /**
   * Generate unique confirmation number
   */
  static async generateConfirmationNumber(): Promise<string> {
    let confirmationNumber: string;
    let exists = true;

    while (exists) {
      // Format: APT-XXXXXX (6 random digits)
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      confirmationNumber = `APT-${randomNum}`;

      // Check if this number already exists
      const existing = await Appointment.findOne({ confirmationNumber });
      exists = !!existing;
    }

    return confirmationNumber!;
  }

  /**
   * Validate if a date is within the advance booking window
   */
  static isDateBookable(
    date: Date,
    advanceBookingDays: number
  ): boolean {
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + advanceBookingDays);

    // Reset time parts for comparison
    const dateOnly = new Date(date.setHours(0, 0, 0, 0));
    const nowOnly = new Date(now.setHours(0, 0, 0, 0));
    const maxDateOnly = new Date(maxDate.setHours(0, 0, 0, 0));

    return dateOnly >= nowOnly && dateOnly <= maxDateOnly;
  }
}

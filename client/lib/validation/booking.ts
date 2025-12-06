import { z } from 'zod';

export const bookingCustomerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  language: z.enum(['ar', 'en']).default('ar'),
});

export const bookingVehicleSchema = z.object({
  make: z.string().min(2, 'Vehicle make is required'),
  model: z.string().min(1, 'Vehicle model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
});

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  appointmentDate: z.string().or(z.date()),
  startTime: z.string().or(z.date()),
  notes: z.string().optional(),
  customer: bookingCustomerSchema,
  vehicle: bookingVehicleSchema,
});

export type BookingCustomerInput = z.infer<typeof bookingCustomerSchema>;
export type BookingVehicleInput = z.infer<typeof bookingVehicleSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

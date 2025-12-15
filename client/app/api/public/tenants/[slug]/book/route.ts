import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';
import Customer from '@/lib/models/Customer';
import Vehicle from '@/lib/models/Vehicle';
import Service from '@/lib/models/Service';
import Appointment from '@/lib/models/Appointment';
import Mechanic from '@/lib/models/Mechanic';
import { createBookingSchema } from '@/lib/validation/booking';
import { SlotCalculator } from '@/lib/services/SlotCalculator';
import { BookingNotificationService } from '@/lib/services/BookingNotificationService';

// POST /api/public/tenants/[slug]/book
// Create a new appointment from public booking form
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();

    const { slug } = params;
    const body = await req.json();

    // Validate request body
    const validationResult = createBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const bookingData = validationResult.data;

    // Find tenant by slug
    const tenant = await Tenant.findOne({ slug, status: 'active' });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Check if booking is enabled
    if (!tenant.bookingSettings?.enabled) {
      return NextResponse.json(
        { error: 'Online booking is not enabled' },
        { status: 403 }
      );
    }

    // Validate service exists and is bookable
    const service = await Service.findOne({
      _id: bookingData.serviceId,
      tenantId: tenant._id,
      isActive: true,
      bookingEnabled: true,
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found or not available for booking' },
        { status: 404 }
      );
    }

    // Find or create customer
    let customer = await Customer.findOne({
      tenantId: tenant._id,
      email: bookingData.customer.email,
    });

    if (!customer) {
      customer = new Customer({
        tenantId: tenant._id,
        firstName: bookingData.customer.firstName,
        lastName: bookingData.customer.lastName,
        email: bookingData.customer.email,
        phone: bookingData.customer.phone,
        language: bookingData.customer.language,
        isActive: true,
      });
      await customer.save();
    }

    // Find or create vehicle
    let vehicle = await Vehicle.findOne({
      tenantId: tenant._id,
      customerId: customer._id,
      make: bookingData.vehicle.make,
      model: bookingData.vehicle.model,
      year: bookingData.vehicle.year,
    });

    if (!vehicle) {
      vehicle = new Vehicle({
        tenantId: tenant._id,
        customerId: customer._id,
        make: bookingData.vehicle.make,
        model: bookingData.vehicle.model,
        year: bookingData.vehicle.year,
        licensePlate: bookingData.vehicle.licensePlate,
        vin: bookingData.vehicle.vin,
      });
      await vehicle.save();

      // Add vehicle to customer's vehicles array
      customer.vehicles.push(vehicle._id);
      await customer.save();
    }

    // Get first available mechanic (simple assignment)
    const mechanic = await Mechanic.findOne({ tenantId: tenant._id }).sort({ createdAt: 1 });

    if (!mechanic) {
      return NextResponse.json(
        { error: 'No mechanics available. Please contact the shop directly.' },
        { status: 500 }
      );
    }

    // Validate the time slot is still available
    const appointmentDate = new Date(bookingData.appointmentDate);
    const startTime = new Date(bookingData.startTime);
    const duration = service.estimatedDuration || tenant.bookingSettings.appointmentDuration;
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Check for conflicts
    const conflictingAppointment = await Appointment.findOne({
      tenantId: tenant._id,
      appointmentDate: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999)),
      },
      status: { $in: ['scheduled', 'in-progress'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please select another time.' },
        { status: 409 }
      );
    }

    // Generate confirmation number
    const confirmationNumber = await SlotCalculator.generateConfirmationNumber();

    // Calculate estimated cost
    const estimatedCost = service.laborRate * (service.laborHours || 1);

    // Create appointment
    const appointment = new Appointment({
      tenantId: tenant._id,
      customerId: customer._id,
      vehicleId: vehicle._id,
      serviceId: service._id,
      mechanicId: mechanic._id,
      appointmentDate: new Date(bookingData.appointmentDate),
      startTime,
      endTime,
      status: 'scheduled',
      priority: 'medium',
      source: 'customer',
      confirmationNumber,
      requiresApproval: tenant.bookingSettings.requireApproval,
      notes: bookingData.notes,
      estimatedCost,
    });

    await appointment.save();

    // Send notifications (fire and forget)
    Promise.all([
      BookingNotificationService.sendCustomerConfirmation(
        appointment,
        customer,
        tenant,
        service
      ),
      BookingNotificationService.sendAdminNotification(
        appointment,
        customer,
        tenant,
        service
      ),
    ]).catch(error => {
    });

    return NextResponse.json({
      success: true,
      confirmationNumber,
      appointment: {
        id: appointment._id,
        confirmationNumber: appointment.confirmationNumber,
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        requiresApproval: appointment.requiresApproval,
        service: {
          name: service.name,
          estimatedDuration: service.estimatedDuration,
        },
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    );
  }
}

import { connectToDatabase } from '@/lib/db';
import JobCard from '@/lib/models/JobCard';
import Appointment from '@/lib/models/Appointment';
import Customer from '@/lib/models/Customer';
import Vehicle from '@/lib/models/Vehicle';
import Service from '@/lib/models/Service';
import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppEventListeners } from '@/lib/services/WhatsAppEventListeners';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/job-cards - List job cards for tenant
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query with tenant filter
    const query: Record<string, unknown> = { tenantId };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const totalCount = await JobCard.countDocuments(query);

    const jobCards = await JobCard.find(query)
      .populate('appointmentId', 'appointmentDate startTime endTime')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('services.serviceId', 'name laborHours laborRate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      jobCards,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    });
  },
  { requireTenant: true }
);

// POST /api/job-cards - Create job card for tenant
export const POST = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const body = await req.json();

    // Validate appointment belongs to tenant (if provided)
    if (body.appointmentId) {
      const appointment = await Appointment.findOne({
        _id: body.appointmentId,
        tenantId,
      });
      if (!appointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 400 }
        );
      }
    }

    // Validate customer belongs to tenant
    const customer = await Customer.findOne({
      _id: body.customerId,
      tenantId,
    });
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 400 }
      );
    }

    // Validate vehicle belongs to tenant
    const vehicle = await Vehicle.findOne({
      _id: body.vehicleId,
      tenantId,
    });
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 400 }
      );
    }

    // Validate services belong to tenant
    if (body.services && body.services.length > 0) {
      for (const serviceItem of body.services) {
        const service = await Service.findOne({
          _id: serviceItem.serviceId,
          tenantId,
        });
        if (!service) {
          return NextResponse.json(
            { error: `Service ${serviceItem.serviceId} not found` },
            { status: 400 }
          );
        }
      }
    }

    // Filter out parts with empty or invalid partId
    const validPartsUsed = (body.partsUsed || []).filter((part: { partId?: string }) => {
      return part.partId && part.partId.trim() !== '';
    });

    const jobCardNumber = await JobCard.getNextJobCardNumber(tenantId);

    const jobCardData: Record<string, unknown> = {
      tenantId, // Always set tenantId from auth context
      jobCardNumber,
      customerId: body.customerId,
      vehicleId: body.vehicleId,
      type: body.type || 'regular',
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      services: body.services || [],
      partsUsed: validPartsUsed,
      notes: body.notes,
      discount: body.discount || 0,
    };

    if (body.appointmentId) {
      jobCardData.appointmentId = body.appointmentId;
    }

    if (body.estimatedStartTime) {
      jobCardData.estimatedStartTime = new Date(body.estimatedStartTime);
    }

    if (body.estimatedEndTime) {
      jobCardData.estimatedEndTime = new Date(body.estimatedEndTime);
    }

    if (body.inspectionId) {
      jobCardData.inspectionId = body.inspectionId;
    }

    const jobCard = new JobCard(jobCardData);
    await jobCard.save();

    // Update appointment status if linked
    if (body.appointmentId) {
      await Appointment.findOneAndUpdate(
        { _id: body.appointmentId, tenantId },
        { status: 'in-progress' }
      );
    }

    // Send job started WhatsApp message
    try {
      const whatsappListeners = WhatsAppEventListeners.getInstance();
      const jobCardIdString = jobCard._id?.toString();
      if (jobCardIdString) {
        await whatsappListeners.onJobCardOpened(
          body.customerId,
          jobCardIdString
        );
      }
    } catch (whatsappError) {
    }

    const populatedJobCard = await JobCard.findById(jobCard._id)
      .populate('appointmentId', 'appointmentDate startTime endTime')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('services.serviceId', 'name laborHours laborRate');

    return NextResponse.json(
      {
        success: true,
        jobCard: populatedJobCard,
      },
      { status: 201 }
    );
  },
  { requireTenant: true }
);

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { JobCard } from '@/lib/models';
import { WhatsAppEventListeners } from '@/lib/services/WhatsAppEventListeners';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/job-cards/[id] - Get single job card
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    // Filter by BOTH id AND tenantId
    const jobCard = await JobCard.findOne({
      _id: params?.id,
      tenantId,
    })
      .populate('appointmentId')
      .populate(
        'inspectionId',
        'inspectionDate items nextInspectionDate nextInspectionMonths'
      )
      .populate('customerId', 'firstName lastName email phone')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'userId')
      .populate('services.serviceId', 'name description laborHours laborRate')
      .populate('partsUsed.partId', 'name partNumber cost');

    if (!jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(jobCard);
  },
  { requireTenant: true }
);

// PUT /api/job-cards/[id] - Update job card
export const PUT = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    const body = await req.json();

    // Filter out empty appointmentId to prevent ObjectId casting error
    const updateData = { ...body };
    if (
      updateData.appointmentId === '' ||
      updateData.appointmentId === null ||
      updateData.appointmentId === undefined
    ) {
      delete updateData.appointmentId;
    }
    if (
      updateData.inspectionId === '' ||
      updateData.inspectionId === null ||
      updateData.inspectionId === undefined
    ) {
      delete updateData.inspectionId;
    }

    // Update only if belongs to tenant
    const jobCard = await JobCard.findOneAndUpdate(
      { _id: params?.id, tenantId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('appointmentId')
      .populate('customerId', 'firstName lastName email phone')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('services.serviceId', 'name description laborHours laborRate')
      .populate('partsUsed.partId', 'name partNumber cost');

    if (!jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      );
    }

    // Check if job card status changed to completed
    if (body.status === 'completed' && jobCard.customerId) {
      try {
        const whatsappListeners = WhatsAppEventListeners.getInstance();
        await whatsappListeners.onJobCardClosed(jobCard.customerId.toString());
      } catch (whatsappError) {
        console.error(
          'Error sending job completed WhatsApp message:',
          whatsappError
        );
      }
    }

    return NextResponse.json(jobCard);
  },
  { requireTenant: true }
);

// DELETE /api/job-cards/[id] - Delete job card (admin only)
export const DELETE = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    // Delete only if belongs to tenant
    const jobCard = await JobCard.findOneAndDelete({
      _id: params?.id,
      tenantId,
    });

    if (!jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Job card deleted successfully' });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

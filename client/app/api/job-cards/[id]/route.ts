import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from "@/lib/auth-server";
import { JobCard, Customer, Vehicle, Service, Part, Appointment } from '@/lib/models';
import { WhatsAppEventListeners } from '@/lib/services/WhatsAppEventListeners';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const jobCard = await JobCard.findById(id)
      .populate('appointmentId')
      .populate('inspectionId', 'inspectionDate overallCondition totalEstimatedCost items')
      .populate('customerId', 'firstName lastName email phone')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'userId')
      .populate('services.serviceId', 'name description laborHours laborRate')
      .populate('partsUsed.partId', 'name partNumber cost');

    if (!jobCard) {
      return NextResponse.json({ error: 'Job card not found' }, { status: 404 });
    }

    return NextResponse.json(jobCard);
  } catch (error) {
    console.error('Error fetching job card:', error);
    return NextResponse.json({ error: 'Failed to fetch job card' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    
    // Filter out empty appointmentId to prevent ObjectId casting error
    const updateData = { ...body };
    if (updateData.appointmentId === '' || updateData.appointmentId === null || updateData.appointmentId === undefined) {
      delete updateData.appointmentId;
    }
    
    const jobCard = await JobCard.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('appointmentId')
      .populate('customerId', 'firstName lastName email phone')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('services.serviceId', 'name description laborHours laborRate')
      .populate('partsUsed.partId', 'name partNumber cost');

    if (!jobCard) {
      return NextResponse.json({ error: 'Job card not found' }, { status: 404 });
    }

    // Check if job card status changed to completed
    if (body.status === 'completed' && jobCard.customerId) {
      try {
        const whatsappListeners = WhatsAppEventListeners.getInstance();
        await whatsappListeners.onJobCardClosed(jobCard.customerId.toString());
      } catch (whatsappError) {
        console.error('Error sending job completed WhatsApp message:', whatsappError);
        // Don't fail the job card update if WhatsApp fails
      }
    }

    return NextResponse.json(jobCard);
  } catch (error) {
    console.error('Error updating job card:', error);
    return NextResponse.json({ error: 'Failed to update job card' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectToDatabase();
    
    const jobCard = await JobCard.findByIdAndDelete(id);

    if (!jobCard) {
      return NextResponse.json({ error: 'Job card not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job card deleted successfully' });
  } catch (error) {
    console.error('Error deleting job card:', error);
    return NextResponse.json({ error: 'Failed to delete job card' }, { status: 500 });
  }
}

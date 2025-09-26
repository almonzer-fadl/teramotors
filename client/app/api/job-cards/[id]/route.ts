import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from "@/lib/auth-server";
import JobCard from '@/lib/models/JobCard';
import Customer from '@/lib/models/Customer';
import Vehicle from '@/lib/models/Vehicle';
import Service from '@/lib/models/Service';
import Part from '@/lib/models/Part';
import Appointment from '@/lib/models/Appointment';

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
      .populate('customerId', 'firstName lastName email phone')
      .populate('vehicleId', 'make model year licensePlate')
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
    
    const jobCard = await JobCard.findByIdAndUpdate(
      id,
      body,
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

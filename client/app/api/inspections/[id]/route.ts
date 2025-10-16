import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import VehicleInspection from '@/lib/models/VehicleInspection';
import { getServerSession } from "@/lib/auth-server";
import mongoose from 'mongoose';

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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid inspection ID' }, { status: 400 });
    }

    await connectToDatabase();

    const inspection = await VehicleInspection.findById(id)
      .populate('vehicleId', 'make model year licensePlate')
      .populate('customerId', 'firstName lastName')
      .populate('mechanicId', 'firstName lastName displayName')
      .populate('templateId', 'name');

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    return NextResponse.json(inspection);
  } catch (error) {
    console.error('Error fetching inspection:', error);
    return NextResponse.json({ error: 'Failed to fetch inspection' }, { status: 500 });
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid inspection ID' }, { status: 400 });
    }

    await connectToDatabase();

    const body = await request.json();

    // Calculate total estimated cost
    const totalEstimatedCost = body.items.reduce((sum: number, item: any) => sum + (item.estimatedCost || 0), 0);

    const update: any = {
      ...body,
      totalEstimatedCost,
      updatedAt: new Date()
    };

    // If templateId is empty string, unset it to avoid ObjectId cast errors
    if (update.templateId === "" || update.templateId === null || update.templateId === undefined) {
      delete update.templateId;
      update.$unset = { templateId: 1 };
    }

    const inspection = await VehicleInspection.findByIdAndUpdate(
      id,
      update,
      { new: true }
    )
      .populate('vehicleId', 'make model year licensePlate')
      .populate('customerId', 'firstName lastName')
      .populate('mechanicId', 'firstName lastName displayName')
      .populate('templateId', 'name');

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, inspection });
  } catch (error) {
    console.error('Error updating inspection:', error);
    return NextResponse.json({ error: 'Failed to update inspection' }, { status: 500 });
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid inspection ID' }, { status: 400 });
    }

    await connectToDatabase();

    const inspection = await VehicleInspection.findByIdAndDelete(id);

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inspection:', error);
    return NextResponse.json({ error: 'Failed to delete inspection' }, { status: 500 });
  }
}

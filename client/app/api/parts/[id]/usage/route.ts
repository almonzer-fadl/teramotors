import { NextRequest, NextResponse } from 'next/server';
import JobCard from '@/lib/models/JobCard';
import { connectToDatabase } from '@/lib/db';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const jobCards = await JobCard.find({ 'partsUsed.partId': id })
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year');

    return NextResponse.json({ success: true, data: jobCards });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Error fetching part usage' } }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import JobCard from '@/lib/models/JobCard';
import { connectToDatabase } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const jobCards = await JobCard.find({ 'partsUsed.partId': params.id })
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year');

    return NextResponse.json({ success: true, data: jobCards });
  } catch (error) {
    console.error('Error fetching part usage:', error);
    return NextResponse.json({ success: false, error: { message: 'Error fetching part usage' } }, { status: 500 });
  }
}

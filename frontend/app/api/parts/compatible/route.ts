
import { NextRequest, NextResponse } from 'next/server';
import Part from '@/lib/models/Part';
import { connectToDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');

    if (!make || !model || !year) {
      return NextResponse.json({ success: false, error: { message: 'Make, model, and year are required' } }, { status: 400 });
    }

    const parts = await Part.find({
      $or: [
        { compatibleVehicles: { $size: 0 } }, // Parts compatible with all vehicles
        {
          compatibleVehicles: {
            $elemMatch: {
              make: make,
              model: model,
              year: Number(year),
            },
          },
        },
      ],
    });

    return NextResponse.json({ success: true, data: parts });
  } catch (error) {
    console.error('Error fetching compatible parts:', error);
    return NextResponse.json({ success: false, error: { message: 'Error fetching compatible parts' } }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import VehicleInspection, { IVehicleInspection } from '@/lib/models/VehicleInspection';
import { PartMatchingService } from '@/lib/services/PartMatchingService';
import { getServerSession } from '@/lib/auth-server';

// Define a type for the populated inspection document
type InspectionWithVehicle = Omit<IVehicleInspection, 'vehicleId'> & {
    vehicleId: {
      _id: string;
      make: string;
      model: string;
      year: number;
    } | null;
};

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id: inspectionId } = await context.params;

    const inspection = await VehicleInspection.findById(inspectionId)
      .populate('vehicleId', 'make model year')
      .lean<InspectionWithVehicle>();

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    if (!inspection.vehicleId) {
      return NextResponse.json({ error: 'Vehicle not found for this inspection' }, { status: 400 });
    }

    const partMatcher = new PartMatchingService();
    const matchedParts = await partMatcher.matchInspectionItems(
      inspection.items,
      inspection.vehicleId
    );

    return NextResponse.json({ data: matchedParts });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to match parts', details: errorMessage }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { Parser } from 'json2csv';
import Vehicle from '@/lib/models/Vehicle';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    const vehicles = await Vehicle.find({ tenantId }).populate('customerId', 'firstName lastName isActive');

    const fields = [
      { label: 'VIN', value: 'vin' },
      { label: 'Make', value: 'make' },
      { label: 'Model', value: 'model' },
      { label: 'Year', value: 'year' },
      { label: 'Color', value: 'color' },
      { label: 'License Plate', value: 'licensePlate' },
      { label: 'Mileage', value: 'mileage' },
      { label: 'Engine Type', value: 'engineType' },
      { label: 'Transmission', value: 'transmission' },
      { label: 'Fuel Type', value: 'fuelType' },
      { label: 'Customer', value: (row: { customerId: { firstName: any; lastName: any; }; }) => row.customerId ? `${row.customerId.firstName} ${row.customerId.lastName}` : 'No Customer' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(vehicles);

    const response = new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="vehicles.csv"',
      },
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Error exporting vehicles' } }, { status: 500 });
  }
}

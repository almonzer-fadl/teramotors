
import { NextRequest, NextResponse } from 'next/server';
import { Parser } from 'json2csv';
import Vehicle from '@/lib/models/Vehicle';
import { connectToDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const vehicles = await Vehicle.find({}).populate('customerId', 'firstName lastName');

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
      { label: 'Customer', value: 'customerId.firstName' },
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
    console.error('Error exporting vehicles:', error);
    return NextResponse.json({ success: false, error: { message: 'Error exporting vehicles' } }, { status: 500 });
  }
}

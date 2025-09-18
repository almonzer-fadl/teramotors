
import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import Vehicle from '@/lib/models/Vehicle';
import Customer from '@/lib/models/Customer';
import { connectToDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: { message: 'No file uploaded' } }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    const results: any[] = [];
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    const vehicles = await Promise.all(results.map(async (row) => {
      const customerName = row.Customer.split(' ');
      const customer = await Customer.findOne({ firstName: customerName[0], lastName: customerName[1] });

      return {
        vin: row.VIN,
        make: row.Make,
        model: row.Model,
        year: row.Year,
        color: row.Color,
        licensePlate: row['License Plate'],
        mileage: row.Mileage,
        engineType: row['Engine Type'],
        transmission: row.Transmission,
        fuelType: row['Fuel Type'],
        customerId: customer ? customer._id : null,
      };
    }));

    await Vehicle.insertMany(vehicles);

    return NextResponse.json({ success: true, message: `${vehicles.length} vehicles imported successfully` });
  } catch (error) {
    console.error('Error importing vehicles:', error);
    return NextResponse.json({ success: false, error: { message: 'Error importing vehicles' } }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import Customer from '@/lib/models/Customer';
import { connectToDatabase } from '@/lib/db';

const upload = multer({ storage: multer.memoryStorage() });

// Helper to process the upload
const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

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

    const customers = results.map((row) => ({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone,
      address: {
        street: row['address.street'],
        city: row['address.city'],
        state: row['address.state'],
        zipCode: row['address.zipCode'],
        country: row['address.country'],
      },
    }));

    await Customer.insertMany(customers);

    return NextResponse.json({ success: true, message: `${customers.length} customers imported successfully` });
  } catch (error) {
    console.error('Error importing customers:', error);
    return NextResponse.json({ success: false, error: { message: 'Error importing customers' } }, { status: 500 });
  }
}

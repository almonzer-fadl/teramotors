
import { NextRequest, NextResponse } from 'next/server';
import { Parser } from 'json2csv';
import Customer from '@/lib/models/Customer';
import { connectToDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const customers = await Customer.find({});

    const fields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'address.street',
      'address.city',
      'address.state',
      'address.zipCode',
      'address.country',
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(customers);

    const response = new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="customers.csv"',
      },
    });

    return response;
  } catch (error) {
    console.error('Error exporting customers:', error);
    return NextResponse.json({ success: false, error: { message: 'Error exporting customers' } }, { status: 500 });
  }
}

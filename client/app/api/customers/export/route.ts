
import { NextRequest, NextResponse } from 'next/server';
import { Parser } from 'json2csv';
import Customer from '@/lib/models/Customer';
import { connectToDatabase } from '@/lib/db';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const customers = await Customer.find({ tenantId });

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
  }
);

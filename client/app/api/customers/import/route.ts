
import { NextRequest, NextResponse } from 'next/server';
import csv from 'csv-parser';
import { Readable } from 'stream';
import Customer from '@/lib/models/Customer';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from "@/lib/auth-server";
import { uploadRateLimit } from '@/lib/middleware/rate-limit';
import { validateFileUpload, sanitizeInput } from '@/lib/middleware/security';

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = uploadRateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: { message: 'No file uploaded' } }, { status: 400 });
    }

    // Validate CSV file
    const validation = validateFileUpload(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['text/csv', 'application/csv'],
      allowedExtensions: ['.csv']
    });

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: { message: validation.error } }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    const results: any[] = [];
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => {
          // Sanitize CSV data
          const sanitizedData = sanitizeInput(data);
          results.push(sanitizedData);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Validate CSV structure and data
    if (results.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'CSV file is empty' } }, { status: 400 });
    }

    if (results.length > 1000) {
      return NextResponse.json({ success: false, error: { message: 'CSV file contains too many records (max 1000)' } }, { status: 400 });
    }

    const customers = results.map((row) => {
      // Validate required fields
      if (!row.firstName || !row.lastName || !row.email) {
        throw new Error('Missing required fields: firstName, lastName, email');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        throw new Error(`Invalid email format: ${row.email}`);
      }

      return {
        firstName: row.firstName.trim(),
        lastName: row.lastName.trim(),
        email: row.email.trim().toLowerCase(),
        phone: row.phone ? row.phone.trim() : '',
        address: {
          street: row['address.street'] ? row['address.street'].trim() : '',
          city: row['address.city'] ? row['address.city'].trim() : '',
          state: row['address.state'] ? row['address.state'].trim() : '',
          zipCode: row['address.zipCode'] ? row['address.zipCode'].trim() : '',
          country: row['address.country'] ? row['address.country'].trim() : '',
        },
      };
    });

    await Customer.insertMany(customers);

    return NextResponse.json({ success: true, message: `${customers.length} customers imported successfully` });
  } catch (error: any) {
    console.error('Error importing customers:', error);
    return NextResponse.json({ 
      success: false, 
      error: { message: error.message || 'Error importing customers' } 
    }, { status: 500 });
  }
}

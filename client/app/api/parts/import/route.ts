import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import Part from '@/lib/models/Part';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from "@/lib/auth-server";
import { uploadRateLimit } from '@/lib/middleware/rate-limit';

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

    // Basic file validation
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: { message: 'File size exceeds 5MB limit' } }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension || '')) {
      return NextResponse.json({ success: false, error: { message: 'Only Excel files (.xlsx, .xls) are allowed' } }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Validate Excel structure and data
    if (data.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Excel file is empty' } }, { status: 400 });
    }

    if (data.length > 1000) {
      return NextResponse.json({ success: false, error: { message: 'Too many rows. Maximum 1000 rows allowed.' } }, { status: 400 });
    }

    const parts = data.map((row: any, index: number) => {
      // Validate required fields
      if (!row.name || !row.price) {
        throw new Error(`Row ${index + 2}: Missing required fields: name, price`);
      }

      // Validate price is a number
      const price = parseFloat(row.price);
      if (isNaN(price) || price < 0) {
        throw new Error(`Row ${index + 2}: Invalid price value: ${row.price}`);
      }

      // Set default values for required fields
      const cost = row.cost ? parseFloat(row.cost) : price * 0.7; // Default cost as 70% of price
      const stockQuantity = row.stockQuantity ? parseInt(row.stockQuantity) || 0 : 0;
      const minStockLevel = row.minStockLevel ? parseInt(row.minStockLevel) || 0 : 0;

      return {
        name: String(row.name).trim(),
        description: row.description ? String(row.description).trim() : '',
        category: row.category ? String(row.category).trim() : '',
        manufacturer: row.manufacturer ? String(row.manufacturer).trim() : '',
        cost: cost,
        sellingPrice: price,
        stockQuantity: stockQuantity,
        minStockLevel: minStockLevel,
        location: row.location ? String(row.location).trim() : '',
        partNumber: row.partNumber ? String(row.partNumber).trim() : undefined,
        isActive: true,
      };
    });

    // Insert parts in batches to avoid memory issues
    const batchSize = 100;
    let importedCount = 0;
    
    for (let i = 0; i < parts.length; i += batchSize) {
      const batch = parts.slice(i, i + batchSize);
      await Part.insertMany(batch);
      importedCount += batch.length;
    }

    return NextResponse.json({ 
      success: true, 
      message: `${importedCount} parts imported successfully` 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: { message: error.message || 'Error importing parts' } 
    }, { status: 500 });
  }
}

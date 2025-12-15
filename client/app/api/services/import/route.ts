import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import Service from '@/lib/models/Service';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from "@/lib/auth-server";
import { uploadRateLimit } from '@/lib/middleware/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Temporarily disable rate limiting for debugging
    // const rateLimitResponse = uploadRateLimit(req);
    // if (rateLimitResponse) {
    //   // console.log('Rate limit exceeded');
    //   return rateLimitResponse;
    // }

    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    try {
      await connectToDatabase();

      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Read as array-of-arrays to preserve headers as-is (handles RTL/Arabic)
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[];

      // Helper: normalize bidi and whitespace and lowercase
      const stripBidi = (s: string) => s.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '');
      const normalizeHeader = (h: any) => {
        const raw = String(h ?? '').trim();
        const cleaned = stripBidi(raw).toLowerCase();
        // Map common Arabic labels to canonical names
        const arabicName = ['الاسم', 'اسم', 'اسم الخدمة', 'اسم الخدمه', 'الخدمة', 'الخدمه'];
        const arabicPrice = ['السعر', 'سعر', 'اجور', 'أجور', 'أجور الصيانة', 'اجور الصيانة', 'تكلفة', 'التكلفة', 'التكلفه'];
        if (arabicName.includes(cleaned)) return 'name';
        if (arabicPrice.includes(cleaned)) return 'price';
        if (cleaned === 'name' || cleaned === 'service' || cleaned === 'service name') return 'name';
        if (cleaned === 'price' || cleaned === 'cost' || cleaned === 'laborrate' || cleaned === 'labor rate') return 'price';
        return cleaned;
      };

      // Helper: normalize Arabic/Indic digits and parse number
      const normalizeDigits = (v: any) => {
        const s = String(v ?? '').trim();
        const map: Record<string, string> = {
          '\u0660': '0','\u0661': '1','\u0662': '2','\u0663': '3','\u0664': '4','\u0665': '5','\u0666': '6','\u0667': '7','\u0668': '8','\u0669': '9',
          '\u06F0': '0','\u06F1': '1','\u06F2': '2','\u06F3': '3','\u06F4': '4','\u06F5': '5','\u06F6': '6','\u06F7': '7','\u06F8': '8','\u06F9': '9'
        };
        const converted = s.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, ch => (map[('\\u'+ch.charCodeAt(0).toString(16).toUpperCase())] ?? ch))
          .replace(/[\s,]/g, '')
          .replace(/[ر س.\u200E\u200F]/g, (m) => (m === '.' ? '.' : '')); // keep dot if exists, drop other stray chars
        return converted;
      };
      const parsePrice = (v: any) => {
        const n = Number(normalizeDigits(v));
        return isFinite(n) ? n : NaN;
      };

      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: { message: 'Excel file is empty' } }, { status: 400 });
      }

      if (rows.length > 1001) { // header + 1000 data rows
        return NextResponse.json({ success: false, error: { message: 'Too many rows. Maximum 1000 rows allowed.' } }, { status: 400 });
      }

      // Determine header row (first non-empty row)
      let headerRowIndex = 0;
      while (headerRowIndex < rows.length && rows[headerRowIndex].every(cell => String(cell ?? '').trim() === '')) headerRowIndex++;
      const headerRow = rows[headerRowIndex] || [];
      const normalizedHeaders = headerRow.map(normalizeHeader);

      // Find name and price column indexes
      let nameCol = normalizedHeaders.findIndex(h => h === 'name');
      let priceCol = normalizedHeaders.findIndex(h => h === 'price');

      // Fallback: if not found, assume first column is name and second numeric-looking column is price
      if (nameCol === -1) nameCol = 0;
      if (priceCol === -1) {
        priceCol = 1;
        // If second column is empty header but later columns exist, still try col 1
      }

      const dataRows = rows.slice(headerRowIndex + 1);

      const services = dataRows
        .map((r, idx) => {
          const rowIndex = headerRowIndex + 2 + idx; // for error messages (1-based including header)
          const rawName = r[nameCol];
          const rawPrice = r[priceCol];

          const name = String(rawName ?? '').trim();
          const priceNum = parsePrice(rawPrice);

          if (!name || isNaN(priceNum)) {
            // Skip completely empty rows silently, error on partially invalid
            const allEmpty = r.every(c => String(c ?? '').trim() === '');
            if (allEmpty) return null;
            throw new Error(`Row ${rowIndex}: Missing or invalid required fields (name, price)`);
          }

          return {
            name,
            description: '',
            category: '',
            laborRate: priceNum,
            laborHours: 1,
            isActive: true,
            isTemplate: false,
          };
        })
        .filter(Boolean) as any[];


      // Insert services in batches to avoid memory issues
      const batchSize = 100;
      let importedCount = 0;
      
      for (let i = 0; i < services.length; i += batchSize) {
        const batch = services.slice(i, i + batchSize);
        await Service.insertMany(batch);
        importedCount += batch.length;
      }


      return NextResponse.json({ 
        success: true, 
        message: `${importedCount} services imported successfully` 
      });
    } catch (dbError) {
      return NextResponse.json({ 
        success: false, 
        error: { message: 'Database error: ' + (dbError instanceof Error ? dbError.message : 'Unknown error') } 
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: { message: error.message || 'Error importing services' } 
    }, { status: 500 });
  }
}

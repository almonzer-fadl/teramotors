
import { NextRequest, NextResponse } from 'next/server';
import Part from '@/lib/models/Part';
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

    const parts = await Part.find({ tenantId });

    const report = {
      totalParts: parts.length,
      totalStockQuantity: parts.reduce((acc, part) => acc + part.stockQuantity, 0),
      totalStockValue: parts.reduce((acc, part) => acc + part.stockQuantity * part.cost, 0),
      lowStockParts: parts.filter(part => part.stockQuantity < part.minStockLevel).map(part => ({
        _id: part._id,
        name: part.name,
        partNumber: part.partNumber,
        stockQuantity: part.stockQuantity,
        minStockLevel: part.minStockLevel,
      })),
      parts: parts.map(part => ({
        _id: part._id,
        name: part.name,
        partNumber: part.partNumber,
        category: part.category,
        manufacturer: part.manufacturer,
        cost: part.cost,
        sellingPrice: part.sellingPrice,
        stockQuantity: part.stockQuantity,
        stockValue: part.stockQuantity * part.cost,
        minStockLevel: part.minStockLevel,
        location: part.location,
      })),
    };

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Error generating inventory report' } }, { status: 500 });
  }
}

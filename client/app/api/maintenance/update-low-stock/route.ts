import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Part from '@/lib/models/Part';
import { getServerSession } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    const parts = await Part.find({ tenantId });
    
    if (parts.length === 0) {
      return NextResponse.json({ message: 'No parts found to update.' });
    }

    const bulkOps = parts.map(part => {
      const isLowStock = part.stockQuantity <= part.minStockLevel;
      return {
        updateOne: {
          filter: { _id: part._id },
          update: { $set: { isLowStock: isLowStock } }
        }
      };
    });

    const result = await Part.bulkWrite(bulkOps);

    return NextResponse.json({
      message: 'Successfully updated isLowStock field for all parts.',
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error updating low stock status:', error);
    return NextResponse.json({ error: 'Failed to update low stock status.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Part from '@/lib/models/Part';

// GET /api/reports/inventory-valuation/summary
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    try {
      const parts = await Part.find({ tenantId }).select('stock_quantity cost_price').lean();

      let totalInventoryValue = 0;
      parts.forEach(part => {
        totalInventoryValue += (part.stock_quantity || 0) * (part.cost_price || 0);
      });

      return NextResponse.json({
        totalInventoryValue,
      });

    } catch (error) {
      console.error('Error fetching Inventory Valuation summary:', error);
      return NextResponse.json({ error: 'Failed to fetch report summary' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

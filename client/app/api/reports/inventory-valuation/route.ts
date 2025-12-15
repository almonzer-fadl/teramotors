import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Part from '@/lib/models/Part';

// GET /api/reports/inventory-valuation
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    try {
      const parts = await Part.find({ tenantId }).lean();

      let totalInventoryValue = 0;
      const valueByCategory: { [key: string]: number } = {};

      const valuedParts = parts.map(part => {
        const partValue = (part.stock_quantity || 0) * (part.cost_price || 0);
        totalInventoryValue += partValue;
        
        const category = part.category || 'Uncategorized';
        valueByCategory[category] = (valueByCategory[category] || 0) + partValue;

        return {
          ...part,
          totalValue: partValue,
        };
      });

      return NextResponse.json({
        totalInventoryValue,
        valueByCategory: Object.entries(valueByCategory).map(([category, totalValue]) => ({ category, totalValue })),
        partCount: parts.length,
        parts: valuedParts,
      });

    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

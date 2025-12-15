import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import { calculateTenantGrowth } from '@/lib/utils/analytics-calculator';

export const GET = withTenantAuth(
  async (req: NextRequest) => {
    await connectToDatabase();
    try {
      const { searchParams } = new URL(req.url);
      const daysParam = searchParams.get('days');
      const days = daysParam ? parseInt(daysParam) : 30;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const tenantGrowthData = await calculateTenantGrowth(startDate, endDate);

      // Calculate summary statistics
      const initialTotal = tenantGrowthData.length > 0 ? tenantGrowthData[0].total : 0;
      const finalTotal = tenantGrowthData.length > 0 ? tenantGrowthData[tenantGrowthData.length - 1].total : 0;
      const newTenants = tenantGrowthData.reduce((sum, item) => sum + item.new, 0);
      const churnedTenants = tenantGrowthData.reduce((sum, item) => sum + item.churned, 0);

      let growthPercentage = 0;
      if (initialTotal !== 0) {
        growthPercentage = ((finalTotal - initialTotal) / initialTotal) * 100;
      } else if (finalTotal > 0) {
        growthPercentage = 100; // Infinite growth if starting from 0
      }

      return NextResponse.json({
        growth: tenantGrowthData,
        summary: {
          initialTotal,
          finalTotal,
          newTenants,
          churnedTenants,
          growthPercentage: parseFloat(growthPercentage.toFixed(2)),
        },
      });

    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch tenant analytics' }, { status: 500 });
    }
  },
  { allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import { calculateRevenueTrend, TrendData } from '@/lib/utils/analytics-calculator';

export const GET = withTenantAuth(
  async (req: NextRequest) => {
    await connectToDatabase();
    try {
      const { searchParams } = new URL(req.url);
      const startDateParam = searchParams.get('startDate');
      const endDateParam = searchParams.get('endDate');
      const interval = (searchParams.get('interval') || 'day') as 'day' | 'week' | 'month';

      const startDate = startDateParam ? new Date(startDateParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
      const endDate = endDateParam ? new Date(endDateParam) : new Date();

      const revenueTrend = await calculateRevenueTrend(startDate, endDate, interval);

      // Calculate summary statistics
      const totalRevenue = revenueTrend.reduce((sum, item) => sum + item.revenue, 0);
      const averageRevenue = revenueTrend.length > 0 ? totalRevenue / revenueTrend.length : 0;

      let growth = 0;
      if (revenueTrend.length > 1) {
        const firstValue = revenueTrend[0].revenue;
        const lastValue = revenueTrend[revenueTrend.length - 1].revenue;
        if (firstValue !== 0) {
          growth = ((lastValue - firstValue) / firstValue) * 100;
        } else if (lastValue > 0) {
          growth = 100; // infinite growth from 0 to a positive number
        }
      }

      return NextResponse.json({
        data: revenueTrend,
        summary: {
          total: totalRevenue,
          average: averageRevenue,
          growth: parseFloat(growth.toFixed(2)),
        },
      });

    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch revenue analytics' }, { status: 500 });
    }
  },
  { allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

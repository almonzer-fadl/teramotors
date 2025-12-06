import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import { calculateMRR, calculateHistoricalMRR } from '@/lib/utils/analytics-calculator';

export const GET = withTenantAuth(
  async (req: NextRequest) => {
    await connectToDatabase();
    try {
      const currentMRR = await calculateMRR();

      // Calculate previous month's MRR
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const previousMRR = await calculateHistoricalMRR(lastMonth);

      let growth = 0;
      if (previousMRR !== 0) {
        growth = ((currentMRR - previousMRR) / previousMRR) * 100;
      } else if (currentMRR > 0) {
        growth = 100; // Infinite growth
      }

      // Generate a simple MRR trend for the last 6 months
      const mrrTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const mrr = await calculateHistoricalMRR(date);
        mrrTrend.push({ date: date.toISOString().split('T')[0].substring(0, 7), mrr }); // YYYY-MM
      }

      return NextResponse.json({
        current: currentMRR,
        previous: previousMRR,
        growth: parseFloat(growth.toFixed(2)),
        trend: mrrTrend,
      });

    } catch (error) {
      console.error('Error fetching MRR analytics:', error);
      return NextResponse.json({ error: 'Failed to fetch MRR analytics' }, { status: 500 });
    }
  },
  { allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

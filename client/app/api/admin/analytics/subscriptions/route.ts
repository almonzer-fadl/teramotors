import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import { calculateSubscriptionDistribution } from '@/lib/utils/analytics-calculator';

export const GET = withTenantAuth(
  async (req: NextRequest) => {
    await connectToDatabase();
    try {
      const distribution = await calculateSubscriptionDistribution();
      return NextResponse.json({ distribution });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch subscription analytics' }, { status: 500 });
    }
  },
  { allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

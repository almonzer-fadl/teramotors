import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';

// GET /api/admin/usage - List all tenants with usage vs limits
export const GET = withTenantAuth(
  async (req: NextRequest) => {
    await connectToDatabase();
    try {
      const tenants = await Tenant.find({}).select('name stats subscription').lean();

      const usageData = tenants.map(tenant => {
        const userLimit = tenant.subscription.maxUsers || 0;
        const vehicleLimit = tenant.subscription.maxVehicles || 0;
        const currentUserCount = tenant.stats.currentUsers || 0;
        const currentVehicleCount = tenant.stats.currentVehicles || 0;

        const userPercentage = userLimit > 0 ? (currentUserCount / userLimit) * 100 : 0;
        const vehiclePercentage = vehicleLimit > 0 ? (currentVehicleCount / vehicleLimit) * 100 : 0;

        return {
          tenantId: tenant._id,
          name: tenant.name,
          users: {
            current: currentUserCount,
            limit: userLimit,
            percentage: userPercentage,
          },
          vehicles: {
            current: currentVehicleCount,
            limit: vehicleLimit,
            percentage: vehiclePercentage,
          },
        };
      });

      return NextResponse.json(usageData);
    } catch (error) {
      console.error('Error fetching usage data:', error);
      return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
    }
  },
  { allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN', 'admin'] }
);

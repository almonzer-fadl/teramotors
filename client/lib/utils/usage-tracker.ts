import Tenant from '@/lib/models/Tenant';
import User from '@/lib/models/User';
import Vehicle from '@/lib/models/Vehicle';
import Customer from '@/lib/models/Customer';

export async function updateTenantStats(tenantId: string): Promise<void> {
  const [userCount, vehicleCount, customerCount] = await Promise.all([
    User.countDocuments({ tenantId }),
    Vehicle.countDocuments({ tenantId }),
    Customer.countDocuments({ tenantId })
  ]);

  await Tenant.findByIdAndUpdate(tenantId, {
    'stats.currentUsers': userCount,
    'stats.currentVehicles': vehicleCount,
    'stats.currentCustomers': customerCount,
    'stats.lastUpdated': new Date()
  });
}

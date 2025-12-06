import Tenant from '@/lib/models/Tenant';

export async function checkUsageLimit(
  tenantId: string,
  resourceType: 'user' | 'vehicle',
  action: 'create' | 'delete'
): Promise<{ allowed: boolean; reason?: string; current: number; limit: number }> {
  const tenant = await Tenant.findById(tenantId);

  if (!tenant) {
    // Or handle as a server error
    throw new Error('Tenant not found');
  }

  const limitKey = resourceType === 'user' ? 'maxUsers' : 'maxVehicles';
  const countKey = resourceType === 'user' ? 'currentUsers' : 'currentVehicles';

  const limit = tenant.subscription[limitKey];
  const current = tenant.stats[countKey];

  if (action === 'create' && current >= limit) {
    return {
      allowed: false,
      reason: `${resourceType} limit reached (${current}/${limit})`,
      current,
      limit
    };
  }

  return { allowed: true, current, limit };
}

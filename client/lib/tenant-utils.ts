import mongoose from 'mongoose';
import { ITenant, Tenant } from '@/lib/models/Tenant';

type TenantIdentifier = string | mongoose.Types.ObjectId;

export async function getTenantById(
  tenantId: TenantIdentifier
): Promise<ITenant | null> {
  return Tenant.findById(tenantId);
}

export async function getTenantBySlug(slug: string): Promise<ITenant | null> {
  return Tenant.findOne({ slug });
}

export async function validateTenantActive(
  tenantId: TenantIdentifier
): Promise<boolean> {
  if (!tenantId) return false;
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return false;

  return tenant.isActive() && !tenant.hasExpired();
}

export async function createTenant(data: {
  name: string;
  slug: string;
  companyInfo: ITenant['companyInfo'];
  createdBy?: mongoose.Types.ObjectId | string;
}): Promise<ITenant> {
  const tenant = new Tenant({
    name: data.name,
    slug: data.slug,
    companyInfo: data.companyInfo,
    status: 'trial',
    createdBy: data.createdBy,
  });

  await tenant.save();
  return tenant;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function userBelongsToTenant(
  userId: TenantIdentifier,
  tenantId: TenantIdentifier
): Promise<boolean> {
  const { default: User } = await import('@/lib/models/User');
  const user = await User.findById(userId);

  if (!user?.tenantId) return false;
  return user.tenantId.toString() === tenantId.toString();
}

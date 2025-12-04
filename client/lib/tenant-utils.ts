/**
 * Tenant Utilities
 * Helper functions for tenant validation and management
 */

import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { ITenant, Tenant } from '@/lib/models/Tenant';

type TenantIdentifier = string | mongoose.Types.ObjectId;

/**
 * Gets tenant data by ID
 */
export async function getTenantById(
  tenantId: TenantIdentifier
): Promise<ITenant | null> {
  if (!tenantId) return null;

  try {
    await connectToDatabase();
    return await Tenant.findById(tenantId);
  } catch (error) {
    console.error('Error getting tenant:', error);
    return null;
  }
}

/**
 * Gets tenant data by slug
 */
export async function getTenantBySlug(slug: string): Promise<ITenant | null> {
  if (!slug) return null;

  try {
    await connectToDatabase();
    return await Tenant.findOne({ slug });
  } catch (error) {
    console.error('Error getting tenant by slug:', error);
    return null;
  }
}

/**
 * Validates that a tenant is active and can be used
 */
export async function validateTenantActive(
  tenantId: TenantIdentifier
): Promise<boolean> {
  if (!tenantId) return false;

  try {
    await connectToDatabase();
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) return false;
    if (!tenant.isActive()) return false;
    if (tenant.hasExpired()) return false;

    // Check tenant status (not subscription plan)
    const tenantStatus = tenant.status;
    if (tenantStatus === 'cancelled' || tenantStatus === 'suspended') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating tenant:', error);
    return false;
  }
}

/**
 * Creates a new tenant
 */
export async function createTenant(data: {
  name: string;
  slug: string;
  companyInfo: ITenant['companyInfo'];
  createdBy?: mongoose.Types.ObjectId | string;
}): Promise<ITenant> {
  await connectToDatabase();

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

/**
 * Generates a URL-safe slug from a name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Checks if a user belongs to a specific tenant
 */
export async function userBelongsToTenant(
  userId: TenantIdentifier,
  tenantId: TenantIdentifier
): Promise<boolean> {
  try {
    await connectToDatabase();
    const { default: User } = await import('@/lib/models/User');
    const user = await User.findById(userId);

    if (!user?.tenantId) return false;
    return user.tenantId.toString() === tenantId.toString();
  } catch (error) {
    console.error('Error checking user tenant:', error);
    return false;
  }
}

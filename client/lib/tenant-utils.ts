/**
 * Tenant Utilities
 * Helper functions for tenant validation and management
 */

import { connectToDatabase } from '@/lib/db'

/**
 * Validates that a tenant is active and can be used
 */
export async function validateTenantActive(tenantId: string): Promise<boolean> {
  if (!tenantId) return false

  try {
    await connectToDatabase()
    const mongoose = await import('mongoose')

    // Check if Tenant model exists
    const Tenant = mongoose.models.Tenant
    if (!Tenant) {
      // If no Tenant model, assume tenant is valid (single-tenant mode)
      return true
    }

    const tenant = await Tenant.findById(tenantId).select('isActive subscription.status')

    if (!tenant) return false
    if (!tenant.isActive) return false

    // Check subscription status
    const status = tenant.subscription?.status
    if (status === 'suspended' || status === 'cancelled') {
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating tenant:', error)
    return false
  }
}

/**
 * Gets tenant data by ID
 */
export async function getTenantById(tenantId: string) {
  if (!tenantId) return null

  try {
    await connectToDatabase()
    const mongoose = await import('mongoose')

    const Tenant = mongoose.models.Tenant
    if (!Tenant) return null

    return await Tenant.findById(tenantId)
  } catch (error) {
    console.error('Error getting tenant:', error)
    return null
  }
}

/**
 * Gets tenant data by slug
 */
export async function getTenantBySlug(slug: string) {
  if (!slug) return null

  try {
    await connectToDatabase()
    const mongoose = await import('mongoose')

    const Tenant = mongoose.models.Tenant
    if (!Tenant) return null

    return await Tenant.findOne({ slug })
  } catch (error) {
    console.error('Error getting tenant by slug:', error)
    return null
  }
}

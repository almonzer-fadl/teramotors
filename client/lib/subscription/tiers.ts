/**
 * Subscription Tiers Configuration
 * Defines pricing, features, and limits for each subscription tier
 */

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise'

export interface PricingInfo {
  monthly: number
  annual: number // Price per month when billed annually
  currency: string
}

export interface TierFeature {
  id: string
  name: string
  description: string
  included: boolean
  limit?: number | 'unlimited'
}

export interface TierConfig {
  id: SubscriptionTier
  name: string
  description: string
  pricing: PricingInfo
  popular?: boolean
  features: TierFeature[]
  limits: TierLimits
  badge?: string
  color: string // Tailwind gradient classes for tier styling
}

export interface TierLimits {
  maxCustomers: number | -1 // -1 = unlimited
  maxVehicles: number | -1
  maxInvoicesPerMonth: number | -1
  maxUsers: number | -1
  maxStorageGB: number | -1
  apiCallsPerDay: number | -1
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
  free: {
    id: 'free',
    name: 'marketing.pricing.free_tier.name',
    description: 'marketing.pricing.free_tier.description',
    color: 'from-gray-500 to-gray-600',
    pricing: {
      monthly: 0,
      annual: 0,
      currency: 'SAR',
    },
    limits: {
      maxCustomers: 50,
      maxVehicles: 100,
      maxInvoicesPerMonth: 20,
      maxUsers: 2,
      maxStorageGB: 1,
      apiCallsPerDay: 100,
    },
    features: [
      { id: 'customer_management', name: 'marketing.pricing.features.customer_management_free.name', description: 'marketing.pricing.features.customer_management_free.description', included: true, limit: 50 },
      { id: 'vehicle_tracking', name: 'marketing.pricing.features.vehicle_tracking_free.name', description: 'marketing.pricing.features.vehicle_tracking_free.description', included: true, limit: 100 },
      { id: 'basic_invoicing', name: 'marketing.pricing.features.basic_invoicing_free.name', description: 'marketing.pricing.features.basic_invoicing_free.description', included: true, limit: 20 },
      { id: 'job_cards', name: 'marketing.pricing.features.job_cards_free.name', description: 'marketing.pricing.features.job_cards_free.description', included: true },
      { id: 'email_support', name: 'marketing.pricing.features.email_support.name', description: 'marketing.pricing.features.email_support.description', included: false },
      { id: 'parts_inventory', name: 'marketing.pricing.features.parts_inventory.name', description: 'marketing.pricing.features.parts_inventory.description', included: false },
      { id: 'zatca_compliance', name: 'marketing.pricing.features.zatca_compliance.name', description: 'marketing.pricing.features.zatca_compliance.description', included: false },
      { id: 'whatsapp_integration', name: 'marketing.pricing.features.whatsapp_integration.name', description: 'marketing.pricing.features.whatsapp_integration.description', included: false },
      { id: 'reports', name: 'marketing.pricing.features.advanced_reports.name', description: 'marketing.pricing.features.advanced_reports.description', included: false },
      { id: 'api_access', name: 'marketing.pricing.features.api_access.name', description: 'marketing.pricing.features.api_access.description', included: false },
    ],
  },

  basic: {
    id: 'basic',
    name: 'marketing.pricing.basic.name',
    description: 'marketing.pricing.basic.description',
    color: 'from-blue-500 to-blue-600',
    pricing: {
      monthly: 199,
      annual: 166, // ~17% discount
      currency: 'SAR',
    },
    limits: {
      maxCustomers: 500,
      maxVehicles: 1000,
      maxInvoicesPerMonth: 200,
      maxUsers: 5,
      maxStorageGB: 10,
      apiCallsPerDay: 1000,
    },
    features: [
      { id: 'customer_management', name: 'marketing.pricing.features.customer_management_basic.name', description: 'marketing.pricing.features.customer_management_basic.description', included: true, limit: 500 },
      { id: 'vehicle_tracking', name: 'marketing.pricing.features.vehicle_tracking_basic.name', description: 'marketing.pricing.features.vehicle_tracking_basic.description', included: true, limit: 1000 },
      { id: 'basic_invoicing', name: 'marketing.pricing.features.basic_invoicing_basic.name', description: 'marketing.pricing.features.basic_invoicing_basic.description', included: true, limit: 200 },
      { id: 'job_cards', name: 'marketing.pricing.features.job_cards_basic.name', description: 'marketing.pricing.features.job_cards_basic.description', included: true },
      { id: 'email_support', name: 'marketing.pricing.features.email_support_basic.name', description: 'marketing.pricing.features.email_support_basic.description', included: true },
      { id: 'parts_inventory', name: 'marketing.pricing.features.parts_inventory_basic.name', description: 'marketing.pricing.features.parts_inventory_basic.description', included: true },
      { id: 'zatca_compliance', name: 'marketing.pricing.features.zatca_compliance.name', description: 'marketing.pricing.features.zatca_compliance.description', included: false },
      { id: 'whatsapp_integration', name: 'marketing.pricing.features.whatsapp_integration.name', description: 'marketing.pricing.features.whatsapp_integration.description', included: false },
      { id: 'reports', name: 'marketing.pricing.features.basic_reports.name', description: 'marketing.pricing.features.basic_reports.description', included: true },
      { id: 'api_access', name: 'marketing.pricing.features.api_access.name', description: 'marketing.pricing.features.api_access.description', included: false },
    ],
  },

  pro: {
    id: 'pro',
    name: 'marketing.pricing.pro.name',
    description: 'marketing.pricing.pro.description',
    color: 'from-[#F97402] to-[#F13F33]',
    pricing: {
      monthly: 499,
      annual: 416, // ~17% discount
      currency: 'SAR',
    },
    popular: true,
    badge: 'marketing.pricing.most_popular_badge',
    limits: {
      maxCustomers: 2000,
      maxVehicles: 5000,
      maxInvoicesPerMonth: 1000,
      maxUsers: 15,
      maxStorageGB: 50,
      apiCallsPerDay: 10000,
    },
    features: [
      { id: 'customer_management', name: 'marketing.pricing.features.customer_management_pro.name', description: 'marketing.pricing.features.customer_management_pro.description', included: true, limit: 2000 },
      { id: 'vehicle_tracking', name: 'marketing.pricing.features.vehicle_tracking_pro.name', description: 'marketing.pricing.features.vehicle_tracking_pro.description', included: true, limit: 5000 },
      { id: 'basic_invoicing', name: 'marketing.pricing.features.basic_invoicing_pro.name', description: 'marketing.pricing.features.basic_invoicing_pro.description', included: true, limit: 1000 },
      { id: 'job_cards', name: 'marketing.pricing.features.job_cards_pro.name', description: 'marketing.pricing.features.job_cards_pro.description', included: true },
      { id: 'email_support', name: 'marketing.pricing.features.priority_support.name', description: 'marketing.pricing.features.priority_support.description', included: true },
      { id: 'parts_inventory', name: 'marketing.pricing.features.parts_inventory_pro.name', description: 'marketing.pricing.features.parts_inventory_pro.description', included: true },
      { id: 'zatca_compliance', name: 'marketing.pricing.features.zatca_compliance_pro.name', description: 'marketing.pricing.features.zatca_compliance_pro.description', included: true },
      { id: 'whatsapp_integration', name: 'marketing.pricing.features.whatsapp_integration_pro.name', description: 'marketing.pricing.features.whatsapp_integration_pro.description', included: true },
      { id: 'reports', name: 'marketing.pricing.features.advanced_reports_pro.name', description: 'marketing.pricing.features.advanced_reports_pro.description', included: true },
      { id: 'api_access', name: 'marketing.pricing.features.api_access.name', description: 'marketing.pricing.features.api_access.description', included: false },
    ],
  },

  enterprise: {
    id: 'enterprise',
    name: 'marketing.pricing.enterprise.name',
    description: 'marketing.pricing.enterprise.description',
    color: 'from-purple-600 to-indigo-600',
    pricing: {
      monthly: -1, // Contact sales
      annual: -1,
      currency: 'SAR',
    },
    badge: 'marketing.pricing.custom_pricing_badge',
    limits: {
      maxCustomers: -1, // Unlimited
      maxVehicles: -1,
      maxInvoicesPerMonth: -1,
      maxUsers: -1,
      maxStorageGB: -1,
      apiCallsPerDay: -1,
    },
    features: [
      { id: 'customer_management', name: 'marketing.pricing.features.customer_management_enterprise.name', description: 'marketing.pricing.features.customer_management_enterprise.description', included: true, limit: 'unlimited' },
      { id: 'vehicle_tracking', name: 'marketing.pricing.features.vehicle_tracking_enterprise.name', description: 'marketing.pricing.features.vehicle_tracking_enterprise.description', included: true, limit: 'unlimited' },
      { id: 'basic_invoicing', name: 'marketing.pricing.features.basic_invoicing_enterprise.name', description: 'marketing.pricing.features.basic_invoicing_enterprise.description', included: true, limit: 'unlimited' },
      { id: 'job_cards', name: 'marketing.pricing.features.job_cards_enterprise.name', description: 'marketing.pricing.features.job_cards_enterprise.description', included: true },
      { id: 'email_support', name: 'marketing.pricing.features.dedicated_support.name', description: 'marketing.pricing.features.dedicated_support.description', included: true },
      { id: 'parts_inventory', name: 'marketing.pricing.features.parts_inventory_enterprise.name', description: 'marketing.pricing.features.parts_inventory_enterprise.description', included: true },
      { id: 'zatca_compliance', name: 'marketing.pricing.features.zatca_compliance_enterprise.name', description: 'marketing.pricing.features.zatca_compliance_enterprise.description', included: true },
      { id: 'whatsapp_integration', name: 'marketing.pricing.features.whatsapp_integration_enterprise.name', description: 'marketing.pricing.features.whatsapp_integration_enterprise.description', included: true },
      { id: 'reports', name: 'marketing.pricing.features.custom_reports.name', description: 'marketing.pricing.features.custom_reports.description', included: true },
      { id: 'api_access', name: 'marketing.pricing.features.full_api_access.name', description: 'marketing.pricing.features.full_api_access.description', included: true },
      { id: 'white_label', name: 'marketing.pricing.features.white_label.name', description: 'marketing.pricing.features.white_label.description', included: true },
      { id: 'sso', name: 'marketing.pricing.features.sso.name', description: 'marketing.pricing.features.sso.description', included: true },
      { id: 'audit_logs', name: 'marketing.pricing.features.audit_logs.name', description: 'marketing.pricing.features.audit_logs.description', included: true },
    ],
  },
}

// Helper functions
export function getTierByPrice(monthlyPrice: number): SubscriptionTier | null {
  const tier = Object.values(SUBSCRIPTION_TIERS).find(t => t.pricing.monthly === monthlyPrice)
  return tier?.id || null
}

export function formatPrice(price: number, currency: string = 'SAR'): string {
  if (price === -1) return 'Contact Us'
  if (price === 0) return 'Free'
  return `${currency} ${price.toLocaleString()}`
}

export function getMonthlyPrice(tier: SubscriptionTier, annual: boolean = false): number {
  const config = SUBSCRIPTION_TIERS[tier]
  return annual ? config.pricing.annual : config.pricing.monthly
}

export function getAnnualSavings(tier: SubscriptionTier): number {
  const config = SUBSCRIPTION_TIERS[tier]
  if (config.pricing.monthly === -1 || config.pricing.monthly === 0) return 0
  return (config.pricing.monthly - config.pricing.annual) * 12
}

export function isFeatureIncluded(tier: SubscriptionTier, featureId: string): boolean {
  const config = SUBSCRIPTION_TIERS[tier]
  const feature = config.features.find(f => f.id === featureId)
  return feature?.included ?? false
}

export function getFeatureLimit(tier: SubscriptionTier, featureId: string): number | 'unlimited' | null {
  const config = SUBSCRIPTION_TIERS[tier]
  const feature = config.features.find(f => f.id === featureId)
  return feature?.limit ?? null
}

export function checkLimit(tier: SubscriptionTier, limitType: keyof TierLimits, currentValue: number): {
  allowed: boolean
  limit: number | 'unlimited'
  remaining: number | 'unlimited'
} {
  const config = SUBSCRIPTION_TIERS[tier]
  const limit = config.limits[limitType]

  if (limit === -1) {
    return { allowed: true, limit: 'unlimited', remaining: 'unlimited' }
  }

  return {
    allowed: currentValue < limit,
    limit,
    remaining: Math.max(0, limit - currentValue),
  }
}

export function compareTiers(tier1: SubscriptionTier, tier2: SubscriptionTier): number {
  const order: Record<SubscriptionTier, number> = { free: 0, basic: 1, pro: 2, enterprise: 3 }
  return order[tier1] - order[tier2]
}

export function getUpgradePath(currentTier: SubscriptionTier): SubscriptionTier[] {
  const order: SubscriptionTier[] = ['free', 'basic', 'pro', 'enterprise']
  const currentIndex = order.indexOf(currentTier)
  return order.slice(currentIndex + 1)
}

export function getTierConfig(tier: SubscriptionTier): TierConfig {
  return SUBSCRIPTION_TIERS[tier]
}

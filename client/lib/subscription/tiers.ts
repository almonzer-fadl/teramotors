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
    name: 'Free',
    description: 'Perfect for getting started',
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
      { id: 'customer_management', name: 'Customer Management', description: 'Basic customer tracking', included: true, limit: 50 },
      { id: 'vehicle_tracking', name: 'Vehicle Tracking', description: 'Track vehicle history', included: true, limit: 100 },
      { id: 'basic_invoicing', name: 'Basic Invoicing', description: 'Create and send invoices', included: true, limit: 20 },
      { id: 'job_cards', name: 'Job Cards', description: 'Create job cards', included: true },
      { id: 'email_support', name: 'Email Support', description: 'Standard email support', included: false },
      { id: 'parts_inventory', name: 'Parts Inventory', description: 'Track parts and stock', included: false },
      { id: 'zatca_compliance', name: 'ZATCA E-Invoicing', description: 'Saudi tax compliance', included: false },
      { id: 'whatsapp_integration', name: 'WhatsApp Integration', description: 'Customer notifications', included: false },
      { id: 'reports', name: 'Advanced Reports', description: 'Business analytics', included: false },
      { id: 'api_access', name: 'API Access', description: 'Developer API access', included: false },
    ],
  },

  basic: {
    id: 'basic',
    name: 'Basic',
    description: 'For growing workshops',
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
      { id: 'customer_management', name: 'Customer Management', description: 'Full customer tracking', included: true, limit: 500 },
      { id: 'vehicle_tracking', name: 'Vehicle Tracking', description: 'Complete vehicle history', included: true, limit: 1000 },
      { id: 'basic_invoicing', name: 'Invoicing', description: 'Create and send invoices', included: true, limit: 200 },
      { id: 'job_cards', name: 'Job Cards', description: 'Create job cards', included: true },
      { id: 'email_support', name: 'Email Support', description: 'Priority email support', included: true },
      { id: 'parts_inventory', name: 'Parts Inventory', description: 'Track parts and stock', included: true },
      { id: 'zatca_compliance', name: 'ZATCA E-Invoicing', description: 'Saudi tax compliance', included: false },
      { id: 'whatsapp_integration', name: 'WhatsApp Integration', description: 'Customer notifications', included: false },
      { id: 'reports', name: 'Basic Reports', description: 'Essential analytics', included: true },
      { id: 'api_access', name: 'API Access', description: 'Developer API access', included: false },
    ],
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professional workshops',
    color: 'from-[#F97402] to-[#F13F33]',
    pricing: {
      monthly: 499,
      annual: 416, // ~17% discount
      currency: 'SAR',
    },
    popular: true,
    badge: 'Most Popular',
    limits: {
      maxCustomers: 2000,
      maxVehicles: 5000,
      maxInvoicesPerMonth: 1000,
      maxUsers: 15,
      maxStorageGB: 50,
      apiCallsPerDay: 10000,
    },
    features: [
      { id: 'customer_management', name: 'Customer Management', description: 'Unlimited customer tracking', included: true, limit: 2000 },
      { id: 'vehicle_tracking', name: 'Vehicle Tracking', description: 'Complete vehicle history', included: true, limit: 5000 },
      { id: 'basic_invoicing', name: 'Invoicing', description: 'Unlimited invoices', included: true, limit: 1000 },
      { id: 'job_cards', name: 'Job Cards', description: 'Advanced job management', included: true },
      { id: 'email_support', name: 'Priority Support', description: '24/7 priority support', included: true },
      { id: 'parts_inventory', name: 'Parts Inventory', description: 'Advanced inventory management', included: true },
      { id: 'zatca_compliance', name: 'ZATCA E-Invoicing', description: 'Full Saudi tax compliance', included: true },
      { id: 'whatsapp_integration', name: 'WhatsApp Integration', description: 'Automated notifications', included: true },
      { id: 'reports', name: 'Advanced Reports', description: 'Full business analytics', included: true },
      { id: 'api_access', name: 'API Access', description: 'Developer API access', included: false },
    ],
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large operations',
    color: 'from-purple-600 to-indigo-600',
    pricing: {
      monthly: -1, // Contact sales
      annual: -1,
      currency: 'SAR',
    },
    badge: 'Custom Pricing',
    limits: {
      maxCustomers: -1, // Unlimited
      maxVehicles: -1,
      maxInvoicesPerMonth: -1,
      maxUsers: -1,
      maxStorageGB: -1,
      apiCallsPerDay: -1,
    },
    features: [
      { id: 'customer_management', name: 'Customer Management', description: 'Unlimited everything', included: true, limit: 'unlimited' },
      { id: 'vehicle_tracking', name: 'Vehicle Tracking', description: 'Unlimited vehicle history', included: true, limit: 'unlimited' },
      { id: 'basic_invoicing', name: 'Invoicing', description: 'Unlimited invoices', included: true, limit: 'unlimited' },
      { id: 'job_cards', name: 'Job Cards', description: 'Enterprise job management', included: true },
      { id: 'email_support', name: 'Dedicated Support', description: 'Dedicated account manager', included: true },
      { id: 'parts_inventory', name: 'Parts Inventory', description: 'Multi-location inventory', included: true },
      { id: 'zatca_compliance', name: 'ZATCA E-Invoicing', description: 'Full compliance + audit', included: true },
      { id: 'whatsapp_integration', name: 'WhatsApp Integration', description: 'Custom workflows', included: true },
      { id: 'reports', name: 'Custom Reports', description: 'Custom dashboards', included: true },
      { id: 'api_access', name: 'Full API Access', description: 'Custom integrations', included: true },
      { id: 'white_label', name: 'White Label', description: 'Your branding', included: true },
      { id: 'sso', name: 'SSO/SAML', description: 'Enterprise authentication', included: true },
      { id: 'audit_logs', name: 'Audit Logs', description: 'Complete audit trail', included: true },
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

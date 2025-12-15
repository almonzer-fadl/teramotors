"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession } from '@/lib/hooks/useSession'

// Subscription tier types
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'active' | 'suspended' | 'cancelled' | 'trialing' | 'past_due'

// Tenant interface
export interface Tenant {
  id: string
  name: string
  slug: string
  logo?: string
  createdAt: Date
  isActive: boolean
}

// Tenant branding - basic as per plan
export interface TenantBranding {
  businessName: string
  logo?: string
}

// Subscription info
export interface TenantSubscription {
  tier: SubscriptionTier
  status: SubscriptionStatus
  expiresAt?: Date
  trialEndsAt?: Date
  features: string[]
}

// Full tenant context
export interface TenantContextValue {
  tenant: Tenant | null
  branding: TenantBranding
  subscription: TenantSubscription
  isLoading: boolean
  error: string | null
  refreshTenant: () => Promise<void>
  updateBranding: (branding: Partial<TenantBranding>) => Promise<void>
}

// Default subscription for free tier
const defaultSubscription: TenantSubscription = {
  tier: 'free',
  status: 'active',
  features: ['basic_invoicing', 'customer_management', 'vehicle_tracking'],
}

// Default branding
const defaultBranding: TenantBranding = {
  businessName: 'Workshop',
}

// Context
const TenantContext = createContext<TenantContextValue | undefined>(undefined)

// Provider props
interface TenantProviderProps {
  children: React.ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { user, isLoading: sessionLoading, isAuthenticated } = useSession()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [branding, setBranding] = useState<TenantBranding>(defaultBranding)
  const [subscription, setSubscription] = useState<TenantSubscription>(defaultSubscription)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tenant data
  const fetchTenant = useCallback(async () => {
    if (sessionLoading) return
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/tenant/current')

      if (!response.ok) {
        if (response.status === 404) {
          // No tenant found - might be super admin or first setup
          setIsLoading(false)
          return
        }
        throw new Error('Failed to fetch tenant')
      }

      const data = await response.json()

      setTenant(data.tenant)
      setBranding({
        businessName: data.tenant?.name || defaultBranding.businessName,
        logo: data.tenant?.logo,
      })

      if (data.subscription) {
        setSubscription({
          tier: data.subscription.tier || 'free',
          status: data.subscription.status || 'active',
          expiresAt: data.subscription.expiresAt ? new Date(data.subscription.expiresAt) : undefined,
          trialEndsAt: data.subscription.trialEndsAt ? new Date(data.subscription.trialEndsAt) : undefined,
          features: data.subscription.features || defaultSubscription.features,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenant')
    } finally {
      setIsLoading(false)
    }
  }, [sessionLoading, isAuthenticated])

  // Refresh tenant data
  const refreshTenant = useCallback(async () => {
    await fetchTenant()
  }, [fetchTenant])

  // Update branding
  const updateBranding = useCallback(async (newBranding: Partial<TenantBranding>) => {
    if (!tenant) return

    try {
      const response = await fetch('/api/tenant/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranding),
      })

      if (!response.ok) {
        throw new Error('Failed to update branding')
      }

      setBranding(prev => ({ ...prev, ...newBranding }))
    } catch (err) {
      throw err
    }
  }, [tenant])

  // Initial fetch
  useEffect(() => {
    fetchTenant()
  }, [fetchTenant])

  const value: TenantContextValue = {
    tenant,
    branding,
    subscription,
    isLoading,
    error,
    refreshTenant,
    updateBranding,
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

// Hook to use tenant context
export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

// Hook to check subscription features
export function useSubscriptionFeature(feature: string): boolean {
  const { subscription } = useTenant()
  return subscription.features.includes(feature)
}

// Hook to check subscription tier
export function useSubscriptionTier(): SubscriptionTier {
  const { subscription } = useTenant()
  return subscription.tier
}

// Hook to check if subscription is active
export function useIsSubscriptionActive(): boolean {
  const { subscription } = useTenant()
  return subscription.status === 'active' || subscription.status === 'trialing'
}

// Subscription tier limits
export const TIER_LIMITS = {
  free: {
    maxCustomers: 50,
    maxVehicles: 100,
    maxInvoicesPerMonth: 20,
    maxUsers: 2,
    features: ['basic_invoicing', 'customer_management', 'vehicle_tracking'],
  },
  basic: {
    maxCustomers: 500,
    maxVehicles: 1000,
    maxInvoicesPerMonth: 200,
    maxUsers: 5,
    features: ['basic_invoicing', 'customer_management', 'vehicle_tracking', 'parts_inventory', 'reports_basic', 'email_support'],
  },
  pro: {
    maxCustomers: 2000,
    maxVehicles: 5000,
    maxInvoicesPerMonth: 1000,
    maxUsers: 15,
    features: ['basic_invoicing', 'customer_management', 'vehicle_tracking', 'parts_inventory', 'reports_advanced', 'zatca_compliance', 'whatsapp_integration', 'priority_support'],
  },
  enterprise: {
    maxCustomers: -1, // Unlimited
    maxVehicles: -1,
    maxInvoicesPerMonth: -1,
    maxUsers: -1,
    features: ['basic_invoicing', 'customer_management', 'vehicle_tracking', 'parts_inventory', 'reports_advanced', 'zatca_compliance', 'whatsapp_integration', 'api_access', 'white_label', 'dedicated_support', 'custom_integrations'],
  },
}

export default TenantContext

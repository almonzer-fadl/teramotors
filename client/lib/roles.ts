'use client'

import { useSession } from '@/lib/hooks/useSession'

// Define role-based navigation items
export const getNavigationItems = (userRole: string) => {
  const baseItems = [
    { tKey: 'sidebar.dashboard', href: '/dashboard', icon: 'LayoutDashboard', roles: ['admin', 'mechanic', 'inspector'] },
    { tKey: 'sidebar.customers', href: '/customers', icon: 'Users', roles: ['admin', 'mechanic', 'inspector'] },
    { tKey: 'sidebar.vehicles', href: '/vehicles', icon: 'Car', roles: ['admin', 'mechanic', 'inspector'] },
    { tKey: 'sidebar.job_cards', href: '/job-cards', icon: 'ClipboardList', roles: ['admin', 'mechanic', 'inspector'] },
    { tKey: 'sidebar.inventory', href: '/inventory', icon: 'Package', roles: ['admin', 'mechanic', 'inspector'] },
    { tKey: 'sidebar.inspections', href: '/inspections', icon: 'Search', roles: ['admin', 'mechanic', 'inspector'] },
    { tKey: 'sidebar.services', href: '/services', icon: 'Wrench', roles: ['admin', 'mechanic', 'inspector'] },
  ]

  // Admin-only items
  const adminOnlyItems = [
    { tKey: 'sidebar.estimates', href: '/estimates', icon: 'FileText', roles: ['admin'] },
    { tKey: 'sidebar.invoices', href: '/invoices', icon: 'CreditCard', roles: ['admin'] },
    { tKey: 'sidebar.payments', href: '/payments', icon: 'CreditCard', roles: ['admin'] },
    { tKey: 'sidebar.whatsapp', href: '/whatsapp', icon: 'MessageSquare', roles: ['admin'] },
    { tKey: 'sidebar.reports', href: '/reports', icon: 'BarChart3', roles: ['admin'] },
    { tKey: 'sidebar.settings', href: '/settings', icon: 'Settings', roles: ['admin'] },
  ]

  // Combine all items and filter by role
  const allItems = [...baseItems, ...adminOnlyItems]
  
  return allItems.filter(item => item.roles.includes(userRole))
}

// Role-based permissions
export const permissions = {
  admin: {
    canDelete: true,
    canManageUsers: true,
    canAccessSettings: true,
    canAccessReports: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewAllData: true,
    canManageSystem: true,
  },
  mechanic: {
    canDelete: false,
    canManageUsers: false,
    canAccessSettings: false,
    canAccessReports: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllData: true,
    canManageSystem: false,
  },
  inspector: {
    canDelete: false,
    canManageUsers: false,
    canAccessSettings: false,
    canAccessReports: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllData: true,
    canManageSystem: false,
  }
}

// Helper function to check permissions
export const hasPermission = (userRole: string, permission: keyof typeof permissions.admin): boolean => {
  return permissions[userRole as keyof typeof permissions]?.[permission] || false
}

// Role display names
export const roleDisplayNames = {
  admin: 'Administrator',
  mechanic: 'Mechanic',
  inspector: 'Inspector',
}

// Role descriptions
export const roleDescriptions = {
  admin: 'Full system access including user management, settings, and reports. Can delete any data.',
  mechanic: 'Can manage customers, vehicles, appointments, jobs, and estimates. Cannot delete data or access admin features.',
  inspector: 'Can perform vehicle inspections and create estimates. Cannot delete data or access admin features.',
}
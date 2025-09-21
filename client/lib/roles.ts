'use client'

import { useSession } from '@/lib/hooks/useSession'

// Define role-based navigation items
export const getNavigationItems = (userRole: string) => {
  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', roles: ['admin', 'mechanic', 'inspector'] },
    { name: 'Customers', href: '/customers', icon: 'Users', roles: ['admin', 'mechanic', 'inspector'] },
    { name: 'Vehicles', href: '/vehicles', icon: 'Car', roles: ['admin', 'mechanic', 'inspector'] },
    { name: 'Appointments', href: '/appointments', icon: 'Calendar', roles: ['admin', 'mechanic', 'inspector'] },
    { name: 'Job Cards', href: '/job-cards', icon: 'ClipboardList', roles: ['admin', 'mechanic', 'inspector'] },
    { name: 'Estimates', href: '/estimates', icon: 'FileText', roles: ['admin', 'mechanic', 'inspector'] },
    { name: 'Invoices', href: '/invoices', icon: 'CreditCard', roles: ['admin', 'mechanic', 'inspector'] },
    { name: 'Parts Inventory', href: '/inventory', icon: 'Package', roles: ['admin', 'mechanic', 'inspector'] },
    { name: 'Inspections', href: '/inspections', icon: 'Search', roles: ['admin', 'mechanic', 'inspector'] },
  ]

  // Admin-only items
  const adminOnlyItems = [
    { name: 'Reports', href: '/reports', icon: 'BarChart3', roles: ['admin'] },
    { name: 'Settings', href: '/settings', icon: 'Settings', roles: ['admin'] },
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
  inspector: 'Inspector'
}

// Role descriptions
export const roleDescriptions = {
  admin: 'Full system access including user management, settings, and reports. Can delete any data.',
  mechanic: 'Can manage customers, vehicles, appointments, jobs, and estimates. Cannot delete data or access admin features.',
  inspector: 'Can perform vehicle inspections and create estimates. Cannot delete data or access admin features.'
}

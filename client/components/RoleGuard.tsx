'use client'
import { useSession } from '@/lib/hooks/useSession'
import { hasPermission } from '@/lib/roles'
import { Shield, Lock } from 'lucide-react'

interface RoleGuardProps {
  allowedRoles?: string[]
  permission?: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showAccessDenied?: boolean
}

export function RoleGuard({ 
  allowedRoles, 
  permission, 
  children, 
  fallback, 
  showAccessDenied = true 
}: RoleGuardProps) {
  const { user } = useSession()
  
  if (!user) {
    return fallback || <div>Please log in</div>
  }

  const userRole = (user as any).role || 'inspector'
  
  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (showAccessDenied) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Access Denied</p>
            <p className="text-xs text-gray-400">Insufficient permissions</p>
          </div>
        </div>
      )
    }
    return fallback || null
  }

  // Check permission-based access
  if (permission && !hasPermission(userRole, permission as any)) {
    if (showAccessDenied) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Access Denied</p>
            <p className="text-xs text-gray-400">Missing required permission</p>
          </div>
        </div>
      )
    }
    return fallback || null
  }
  
  return <>{children}</>
}

// Helper component for admin-only content
export function AdminOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

// Helper component for delete operations
export function DeleteButton({ 
  children, 
  onClick, 
  className = "",
  ...props 
}: { 
  children: React.ReactNode
  onClick: () => void
  className?: string
  [key: string]: any
}) {
  const { user } = useSession()
  const userRole = (user as any)?.role || 'inspector'
  const canDelete = hasPermission(userRole, 'canDelete')

  if (!canDelete) {
    return null
  }

  return (
    <button
      onClick={onClick}
      className={`text-red-600 hover:text-red-900 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

'use client'
import { useSession } from '@/lib/hooks/useSession'
import { hasPermission } from '@/lib/roles'
import { Shield, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RoleGuardProps {
  allowedRoles?: string[]
  permission?: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showAccessDenied?: boolean
  redirectToLogin?: boolean
}

export function RoleGuard({
  allowedRoles,
  permission,
  children,
  fallback,
  showAccessDenied = true,
  redirectToLogin = false
}: RoleGuardProps) {
  const { user, isLoading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user && redirectToLogin) {
      router.push('/login')
    }
  }, [user, isLoading, redirectToLogin, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402]"></div>
      </div>
    )
  }

  if (!user) {
    if (redirectToLogin) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402]"></div>
        </div>
      )
    }
    return fallback || <div>Please log in</div>
  }

  const userRole = (user as any).role || 'inspector'

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (redirectToLogin) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Access Denied</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">You don't have permission to access this page</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-6 py-2 bg-[#F97402] text-white rounded-xl hover:bg-[#F13F33] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }
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

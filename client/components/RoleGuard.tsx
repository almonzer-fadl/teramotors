'use client'
import { useSession } from '@/lib/hooks/useSession'

interface RoleGuardProps {
  allowedRoles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user } = useSession()
  
  if (!user || !allowedRoles.includes((user as any).role)) {
    return fallback || <div>Access Denied</div>
  }
  
  return <>{children}</>
}

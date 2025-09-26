'use client'
import { useSession as useSimpleAuthSession } from '@/lib/simple-auth-client'

export function useSession() {
  return useSimpleAuthSession()
}

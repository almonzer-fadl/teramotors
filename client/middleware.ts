import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Define protected routes and their required roles
const protectedRoutes = {
  '/settings': ['admin'],
  '/reports': ['admin'],
  '/admin': ['admin'],
}

// Define routes that require delete permissions
const deleteRoutes = [
  '/api/customers',
  '/api/vehicles', 
  '/api/appointments',
  '/api/job-cards',
  '/api/estimates',
  '/api/invoices',
  '/api/parts',
  '/api/inspections',
  '/api/users'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if route requires authentication
  const requiresAuth = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  ) || deleteRoutes.some(route => 
    pathname.startsWith(route) && request.method === 'DELETE'
  )

  if (requiresAuth) {
    try {
      const session = await auth()
      
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const userRole = (session.user as any)?.role || 'mechanic'

      // Check page-level permissions
      for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
        if (pathname.startsWith(route)) {
          if (!allowedRoles.includes(userRole)) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
          }
        }
      }

      // Check delete permissions
      if (request.method === 'DELETE') {
        const isDeleteRoute = deleteRoutes.some(route => pathname.startsWith(route))
        if (isDeleteRoute && userRole !== 'admin') {
          return NextResponse.json(
            { error: 'Forbidden - Admin access required for delete operations' },
            { status: 403 }
          )
        }
      }

    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/settings/:path*',
    '/reports/:path*',
    '/admin/:path*',
    '/api/customers/:path*',
    '/api/vehicles/:path*',
    '/api/appointments/:path*',
    '/api/job-cards/:path*',
    '/api/estimates/:path*',
    '/api/invoices/:path*',
    '/api/parts/:path*',
    '/api/inspections/:path*',
    '/api/users/:path*',
  ]
}
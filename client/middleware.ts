import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/api/auth',
    '/api/health',
    '/api/test-connection',
    '/api/test-db'
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For all other routes, check authentication using JWT token
  const token = await getToken({ req: request })
  
  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

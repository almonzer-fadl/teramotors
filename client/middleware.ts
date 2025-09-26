import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
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

  // For all other routes, check for auth token cookie
  const sessionToken = request.cookies.get('auth-token')
  
  // If no session token and trying to access protected route, redirect to login
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url)
    // Only set callbackUrl if it's not already the login page
    if (pathname !== '/login') {
      loginUrl.searchParams.set('callbackUrl', request.url)
    }
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated, allow access
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
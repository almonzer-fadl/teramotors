import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Domain-based routing
  const isMainDomain = hostname === 'teramotor.cc' || hostname === 'www.teramotor.cc'
  const isAppDomain = hostname.startsWith('app.') || hostname.includes('vercel.app')

  // If accessing main domain (teramotor.cc), show landing page
  if (isMainDomain) {
    // Only show landing page on root path
    if (pathname === '/') {
      return NextResponse.next()
    }
    // Redirect other paths on main domain to app subdomain
    const url = request.nextUrl.clone()
    url.host = hostname.replace('teramotor.cc', 'app.teramotor.cc').replace('www.', '')
    return NextResponse.redirect(url)
  }

  // For app domain or Vercel preview domains, apply authentication logic
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

  // Allow public access to invoice PDF view for customers from WhatsApp
  const isInvoicePdfView = pathname.match(/^\/invoices\/[^\/]+\/pdf$/);
  const isInvoiceViewApi = pathname.match(/^\/api\/invoices\/[^\/]+\/view$/);

  if (isInvoicePdfView || isInvoiceViewApi) {
    return NextResponse.next()
  }

  // Allow portal routes (customer portal is public)
  if (pathname.startsWith('/portal/')) {
    return NextResponse.next()
  }

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
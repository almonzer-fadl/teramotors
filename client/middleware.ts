import { auth } from "@/lib/auth"
import { NextResponse } from 'next/server'

const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

const publicApiRoutes = [
    '/api/health',
    '/api/test-connection',
    '/api/test-db',
    '/api/auth' // NextAuth routes are handled by the `auth` wrapper implicitly
]

export const middleware = auth((request) => {
  const { nextUrl } = request;
  const isLoggedIn = !!request.auth;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isPublicApiRoute = publicApiRoutes.some(route => nextUrl.pathname.startsWith(route));

  if (isPublicApiRoute) {
    return null;
  }

  if (isPublicRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return null;
  }

  if (!isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  return null;
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function is updated to handle multi-domain routing and authentication.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Define domains based on your setup
  // The main domain for the marketing/landing page
  const mainDomain = 'teramotor.cc'; 
  // The subdomain for the actual application
  const appDomain = `app.${mainDomain}`;

  // Get the current hostname without the port
  const currentHost = hostname.replace(/:\d+$/, '');

  // --- Marketing Domain Logic ---
  // If the request is for the main marketing domain, let Next.js handle it.
  // The page at app/page.tsx (LandingPage) will be served.
  if (currentHost === mainDomain || currentHost === `www.${mainDomain}`) {
    // If a user on the marketing site tries to access a path that is part of the app,
    // like /dashboard, redirect them to the app subdomain.
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      const url = new URL(pathname, `https://${appDomain}`);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // --- App Domain Logic ---
  // If the request is for the app subdomain or a Vercel preview URL
  if (currentHost === appDomain || hostname.includes('vercel.app')) {
    const sessionToken = request.cookies.get('auth-token');

    // If the user is at the root of the app domain, show them the SaaS landing page.
    if (pathname === '/') {
        return NextResponse.rewrite(new URL('/saas', request.url));
    }

    // Publicly accessible routes on the app domain
    const publicAppRoutes = [
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/verify-email',
      '/saas', // The SaaS landing page is public
      '/api/auth', // All auth-related API endpoints
      '/api/health',
      '/portal', // Customer portal is public
      '/book',   // Public booking page
    ];

    // Check if the requested path is public
    const isPublic = publicAppRoutes.some(p => pathname.startsWith(p));
    
    // If trying to access a protected route without a session token, redirect to login
    if (!isPublic && !sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // If all checks pass, allow the request to proceed
    return NextResponse.next();
  }
  
  // If the hostname matches neither, proceed without changes.
  return NextResponse.next();
}

export const config = {
  // Matcher to run the middleware on all paths except for static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

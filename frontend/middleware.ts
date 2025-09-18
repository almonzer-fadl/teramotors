import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: Request & { nextUrl: URL }) {
  const url = (req as any).nextUrl as URL
  const pathname = url.pathname
  const token = await getToken({ 
    req: req as any,
    secret: process.env.AUTH_SECRET 
  })

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', url))
    }
  }

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', url))
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

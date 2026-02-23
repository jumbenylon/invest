import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

const publicPaths = ['/', '/auth/login', '/auth/register', '/api/auth/login', '/api/auth/register', '/api/seed']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths and static assets
  if (publicPaths.some(p => pathname === p) || pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname === '/manifest.json') {
    return NextResponse.next()
  }

  // Check dashboard routes (client-side auth guard handles this)
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // Protect API routes (API routes handle their own auth via requireAuth)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/mitra-portal/')) {
    const mitraToken =
      request.cookies.get('mitra.session-token')?.value
    if (!mitraToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 401 },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    const cookieHeader = request.headers.get('cookie') ?? ''
    const hasToken =
      cookieHeader.includes('authjs.session-token') ||
      cookieHeader.includes('__Secure-authjs.session-token')

    if (!hasToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 401 },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}

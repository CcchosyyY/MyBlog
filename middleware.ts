import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session');
    const hasValidSession = session?.value && session.value.length > 0;

    if (!hasValidSession && !request.nextUrl.pathname.includes('/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (hasValidSession && request.nextUrl.pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};

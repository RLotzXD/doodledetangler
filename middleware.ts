import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('deckbuilder_auth');
  const isAuthPage = request.nextUrl.pathname === '/login';
  const isApi = request.nextUrl.pathname.startsWith('/api');

  if (isApi && request.nextUrl.pathname === '/api/login') {
    return NextResponse.next();
  }

  if (!authCookie?.value && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authCookie?.value && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

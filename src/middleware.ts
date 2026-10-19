import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'admin_session';

/**
 * Protege /admin (excepto /admin/login). Solo comprueba la presencia del cookie:
 * la verificación criptográfica real ocurre en el servidor (src/lib/auth.ts).
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path !== '/admin/login' && !request.cookies.get(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export const config = { matcher: ['/admin/:path*'] };

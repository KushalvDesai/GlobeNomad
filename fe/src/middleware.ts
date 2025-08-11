import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /login, /register)
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  const token = request.cookies.get('token')?.value;

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);

  // If user is on a public path and has a token, redirect to home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not on a public path and doesn't have a token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
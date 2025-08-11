import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("gn_token")?.value;
  
  // Admin routes protection
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) {
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
  }
  
  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/admin/login"];
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  
  // Protected routes for regular users (redirect to login if no token)
  if (!isPublicRoute && !pathname.startsWith("/admin") && !token) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }
  
  // If user is logged in and tries to access login/register, redirect to home
  if (token && (pathname === "/login" || pathname === "/register")) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};



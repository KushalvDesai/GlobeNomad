import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("gn_token")?.value;
  
  console.log(`Middleware: ${pathname}, token: ${!!token}`);
  
  // Admin routes protection
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) {
      console.log(`Redirecting to admin login for: ${pathname}`);
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
  }
  
  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/admin/login", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
  
  console.log(`Is public route: ${isPublicRoute} for ${pathname}`);
  
  // Protected routes for regular users (redirect to login if no token)
  if (!isPublicRoute && !pathname.startsWith("/admin") && !token) {
    console.log(`Redirecting to login for protected route: ${pathname}`);
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }
  
  // If user is logged in and tries to access login/register, redirect to home
  // Allow forgot-password and reset-password even for logged in users
  if (token && (pathname === "/login" || pathname === "/register")) {
    console.log(`Redirecting logged in user from ${pathname} to home`);
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }
  
  console.log(`Allowing access to: ${pathname}`);
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



import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/token";

/**
 * Next.js 16 Proxy (Edge & Route Guard Convention).
 * Intercepts requests before rendering, enforcing server-side session integrity,
 * cryptographic signature validation, role-based access control, and security headers.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract and cryptographically verify session token
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionCookie);

  // 1. Auth Pages: Authenticated users should not revisit /login or /register
  if ((pathname === "/login" || pathname === "/register") && user) {
    const targetDashboard =
      user.role === "ADMIN"
        ? "/dashboard/admin"
        : user.role === "TRAINER"
        ? "/dashboard/trainer"
        : "/dashboard/student";
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // 2. Admin Dashboard: Strictly requires authenticated session with ADMIN role
  if (pathname.startsWith("/dashboard/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "ADMIN") {
      const fallbackUrl = new URL(
        user.role === "TRAINER" ? "/dashboard/trainer" : "/dashboard/student",
        request.url
      );
      return NextResponse.redirect(fallbackUrl);
    }
  }

  // 3. Trainer Studio: Strictly requires authenticated session with TRAINER or ADMIN role
  if (pathname.startsWith("/dashboard/trainer")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "TRAINER" && user.role !== "ADMIN") {
      const fallbackUrl = new URL("/dashboard/student", request.url);
      return NextResponse.redirect(fallbackUrl);
    }
  }

  // 4. Student Dashboard & Checkout: Requires authenticated session
  if (pathname.startsWith("/dashboard/student") || pathname.startsWith("/checkout")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Learning Classroom: Requires authenticated session
  if (pathname.includes("/learn/")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Forward request with production security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
    "/courses/:slug/learn/:path*",
  ],
};

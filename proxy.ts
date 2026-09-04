import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, TOKEN_COOKIE } from "@/lib/jwt";

// ---------------------------------------------------------------------------
// Proxy = what used to be called Middleware. In Next.js 16 the file was renamed
// from `middleware.ts` to `proxy.ts` (same behaviour, new name). It runs on
// every matched request BEFORE the page renders.
//
// We use it for an "optimistic" auth check: cheaply verify the JWT signature
// from the cookie and redirect. It deliberately does NOT hit the database —
// that keeps it fast on every navigation. The real, authoritative check is
// getCurrentUser() (lib/auth.ts), which each protected page/route also runs.
// Never rely on the proxy alone for security.
// ---------------------------------------------------------------------------

// Pages that require a logged-in user.
const PROTECTED = ["/dashboard"];
// Auth pages a logged-in user shouldn't see — we bounce them to the dashboard.
const AUTH_PAGES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const session = await verifyToken(token);

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Not logged in and trying to reach a protected page → send to /login,
  // remembering where they wanted to go so we can bounce them back after.
  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Already logged in but visiting /login or /register → send to /dashboard.
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Only run the proxy on real page routes. We skip API routes, Next.js
// internals, and static files so it doesn't add overhead where it's not needed.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

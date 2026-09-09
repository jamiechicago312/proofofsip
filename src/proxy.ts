import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Next.js 16's `proxy.ts` file convention (the renamed successor to
 * `middleware.ts` — same request-interception API, new filename).
 *
 * Guards every `/admin/*` route except `/admin` itself, which is the
 * sign-in page (it renders its own "Sign in with GitHub" button when there
 * is no session — see src/app/admin/page.tsx). Unauthenticated visitors to
 * any deeper `/admin/...` route are redirected to `/admin` to sign in,
 * rather than shown a dead-end 403.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin") return NextResponse.next();

  if (!req.auth) {
    const signInUrl = new URL("/admin", req.nextUrl.origin);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

import { NextResponse, type NextRequest } from "next/server";
import { getCookieCache } from "better-auth/cookies";
import { env } from "@/env";

export async function proxy(request: NextRequest) {
  // better-auth's getCookieCache defaults to looking for __Secure-prefixed cookies
  // when NODE_ENV=production, but the API determines the prefix from BETTER_AUTH_URL's
  // scheme (http → no prefix, https → __Secure-). Without this override the proxy
  // can't find the cookie in Docker (production + HTTP) and always redirects to sign-in.
  const isSecure =
    request.url.startsWith("https://") ||
    request.headers.get("x-forwarded-proto") === "https";

  const session = await getCookieCache(request, {
    secret: env.BETTER_AUTH_SECRET,
    strategy: "jwe",
    isSecure,
  });

  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

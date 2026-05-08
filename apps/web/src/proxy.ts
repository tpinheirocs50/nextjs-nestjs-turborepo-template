import { NextResponse, type NextRequest } from "next/server";
import { getCookieCache } from "better-auth/cookies";
import { env } from "@/env";

export async function proxy(request: NextRequest) {
  const session = await getCookieCache(request, {
    secret: env.BETTER_AUTH_SECRET,
    strategy: "jwe",
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

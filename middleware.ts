import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LEGACY_CHANNELS } from "@/lib/legacy-channels";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const parts = pathname.split("/").filter(Boolean);
  const isOnboardingHome = parts.length === 1 && parts[0] === "onboarding";
  const legacyChannel =
    parts.length === 2 &&
    parts[0] === "onboarding" &&
    LEGACY_CHANNELS.has(parts[1].toLowerCase());

  if (isOnboardingHome || legacyChannel) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding.html";
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/onboarding/")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding", "/onboarding/:path*"],
};

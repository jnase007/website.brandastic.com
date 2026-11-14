import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LEGACY_CHANNELS } from "@/lib/legacy-channels";

const APP_ROUTES = new Set(["admin", "api", "file", "onboarding"]);

function redirectTo(request: NextRequest, pathname: string, keepSearch = false) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  if (!keepSearch) url.search = "";
  return NextResponse.redirect(url, 301);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] === "onboarding") {
    if (parts.length === 1) return redirectTo(request, "/");
    if (parts[1] === "admin") {
      const rest = parts.slice(2).join("/");
      return redirectTo(request, rest ? `/admin/${rest}` : "/admin", true);
    }
    if (parts[1] === "file" && parts[2]) {
      return redirectTo(request, `/file/${parts.slice(2).join("/")}`, true);
    }
    if (LEGACY_CHANNELS.has(parts[1].toLowerCase()) || parts.length > 2) {
      return redirectTo(request, "/");
    }
    return redirectTo(request, `/${parts[1]}`, true);
  }

  const response = NextResponse.next();
  const slug = parts.length === 1 ? parts[0].toLowerCase() : "";
  if (slug && !slug.includes(".") && !APP_ROUTES.has(slug)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}

export const config = {
  matcher: ["/onboarding", "/onboarding/:path*", "/:slug"],
};

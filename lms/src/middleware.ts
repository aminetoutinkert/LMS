import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/routing";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
// import { NextAuthRequest } from "next-auth/lib"; // This might not be exported from lib in v5, verifying import

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Check authentication for protected routes
  const protectedPaths = ["/dashboard", "/assignments", "/courses"];

  // Check if current path is protected
  // Note: We need to check if the path (excluding locale) matches protected paths
  const pathname = request.nextUrl.pathname;
  
  // Simple check for protected paths - improved logic would handle locale prefix more robustly
  const isProtected = protectedPaths.some((path) => {
     // Check if path is exactly the protected path or starts with it
     // Also handle locale prefixes e.g. /fr/dashboard
     const pathWithoutLocale = pathname.replace(/^\/(fr|ar|en)/, '') || '/';
     return pathWithoutLocale.startsWith(path);
  });

  if (isProtected) {
    // using getToken requires NEXT_AUTH_SECRET to be set
    const token = await getToken({ req: request, secret: process.env.NEXT_AUTH_SECRET });
    if (!token) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Handle RTL direction for Arabic
  const response = intlMiddleware(request);

  if (request.nextUrl.pathname.startsWith("/ar")) {
    response.headers.set("Content-Language", "ar");
    response.headers.set("direction", "rtl");
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(fr|ar|en)/:path*"],
};

import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { canAccessPath, isAuthPage, isProtectedPath } from "@/lib/auth/permissions";
import { verifyAccessToken } from "@/lib/auth/jwt";

const redirectToLogin = (request: NextRequest) => {
  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  loginUrl.searchParams.set("next", nextPath);

  return NextResponse.redirect(loginUrl);
};

const redirectToDashboard = (request: NextRequest) => {
  return NextResponse.redirect(new URL("/dashboard", request.url));
};

const redirectToForbidden = (request: NextRequest) => {
  return NextResponse.redirect(new URL("/forbidden", request.url));
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname) && !isAuthPage(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return isAuthPage(pathname) ? NextResponse.next() : redirectToLogin(request);
  }

  try {
    const payload = await verifyAccessToken(token);

    if (isAuthPage(pathname)) {
      return redirectToDashboard(request);
    }

    if (!canAccessPath(payload.role, pathname)) {
      return redirectToForbidden(request);
    }

    return NextResponse.next();
  } catch {
    return isAuthPage(pathname) ? NextResponse.next() : redirectToLogin(request);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/watchlists/:path*",
    "/favourites/:path*",
    "/reviews/:path*",
    "/docs/:path*",
    "/editor/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};

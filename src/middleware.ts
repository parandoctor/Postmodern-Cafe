import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/profile"];
const authPaths = ["/login", "/register"];
const publicPaths = ["/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("rainbow_session")?.value;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuth = authPaths.some((path) => pathname.startsWith(path));

  // Redirect authenticated users away from auth pages
  if (isAuth && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard/files", request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtected && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};

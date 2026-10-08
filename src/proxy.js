import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const getSecret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || "");

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch (error) {
    console.error("JWT ERROR:", error);
    return null;
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  console.log("PROXY:", pathname);

  // Login is public
  if (pathname === "/admin/login") {
    const token = request.cookies.get("admin_token")?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(
          new URL("/admin/dashboard/home", request.url)
        );
      }
    }
    return NextResponse.next();
  }

  // Everything else under /admin requires login
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value;

    console.log("TOKEN:", !!token);

    if (!token) {
      console.log("NO TOKEN → LOGIN");

      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      console.log("INVALID TOKEN → LOGIN");

      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );

      response.cookies.delete("admin_token");

      return response;
    }

    // Convenience redirects for base paths that don't have page.js
    if (pathname === "/admin" || pathname === "/admin/dashboard") {
      return NextResponse.redirect(
        new URL("/admin/dashboard/home", request.url)
      );
    }

    console.log("AUTHENTICATED:", payload.email);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

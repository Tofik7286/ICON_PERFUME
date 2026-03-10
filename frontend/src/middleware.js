import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Fix for PayU redirects
  if (pathname === "/payment-process") {
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set("x-forwarded-host", process.env.DOMAIN);
    return NextResponse.next({ request: { headers: reqHeaders } });
  }

  // Redirect to login if accessing profile without token
  if (pathname.startsWith("/profile") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    if (pathname.startsWith("/checkout")) {
      let checkout_source = request.cookies.get("checkout_source");
      const session_token = request.nextUrl.searchParams.get("session_token");

      // Allow access if buynow session_token is in URL or checkout_source cookie exists
      if (checkout_source === undefined && !session_token) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    if (pathname.startsWith("/payment")) {
      let payment_token = request.cookies.get("payment_token");
      if (
        !payment_token ||
        payment_token.value !== process.env.PAYMENT_SECRET
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch (error) {
    console.error("Error validating token:", error.message, error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // Proceed to the requested page if all checks pass
  return NextResponse.next();
}

// Configuration for paths to match
export const config = {
  matcher: [
    "/profile/:path*",
    "/checkout/:path*",
    "/payment/:path*",
    "/payment-process",
  ],
};

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/perfil(.*)",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  // Demo mode: cookies bypass auth on protected routes
  const demoCookie = req.cookies.get("demo_mode")?.value;
  if (demoCookie === "buyer" || demoCookie === "seller") {
    // Block demo buyers from seller dashboard
    if (demoCookie === "buyer" && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/perfil", req.url));
    }
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

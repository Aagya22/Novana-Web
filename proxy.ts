import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "./lib/cookie";

const publicPaths = ["/login", "/register", "/forget-password"];
const adminPaths = ["/admin"];
const userPaths = ["/user"];

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = await getAuthToken();
    const user = token ? await getUserData() : null;
    
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
    const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));
    const isUserPath = userPaths.some((path) => pathname.startsWith(path));
    const isRootPath = pathname === "/";
    
    // If user is not logged in and trying to access protected routes
    if (!user && !isPublicPath && !isRootPath) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // If user is logged in
    if (user && token) {
        // Redirect from root to appropriate landing if authenticated
        if (isRootPath) {
            if (user.role === 'admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', req.url));
            }
            return NextResponse.redirect(new URL('/home', req.url));
        }

        // Admin path protection: only admins can access /admin
        if (isAdminPath && user.role !== 'admin') {
            return NextResponse.redirect(new URL('/home', req.url));
        }

        // User path protection: only regular users can access /user
        // (block admins from hitting user-only pages directly)
        if (isUserPath && user.role !== 'user') {
            // If admin tried to access user routes, send to admin dashboard
            if (user.role === 'admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', req.url));
            }
            return NextResponse.redirect(new URL('/home', req.url));
        }

        // Redirect authenticated users away from public paths to their landing
        if (isPublicPath) {
            if (user.role === 'admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', req.url));
            }
            return NextResponse.redirect(new URL('/home', req.url));
        }
    }
    
    // Allow access to root page if not logged in
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",              // Add root path
        "/admin/:path*",
        "/user/:path*",
        "/login",
        "/register",
        "/home",          // Add home path to ensure it's protected
    ]
}
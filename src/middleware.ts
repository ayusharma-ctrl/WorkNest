import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ 
        req, 
        secret: process.env.AUTH_SECRET!,
        cookieName: "__Secure-authjs.session-token", // "__Secure-authjs.session-token" - prod, "next-authjs.session-token" - local 
    });

    const isAuthenticated = !!token;
    const path = req.nextUrl.pathname;

    const publicPaths = ["/", "/organizing-projects-animate.svg", "/feedback-animate.svg"]; // including svgs
    const isPublicPath = publicPaths.includes(path) || path.startsWith("/api/");

    // Note: for now we have have removed '/auth' page - sigin/signup is one click button - there's no dedicated auth page
    // keeping this logic here for future reference
    // Redirect authenticated users away from auth pages
    if (isAuthenticated && path.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirect unauthenticated users from protected pages
    if (!isPublicPath && !isAuthenticated) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api/auth|api/trpc|_next/static|_next/image|favicon.ico).*)",
    ],
};

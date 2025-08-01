import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes: string[] = ['/login', '/register', '/'];
  
  // Check if the current path is a public route
  const isPublicRoute: boolean = publicRoutes.some((route: string) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Get the auth token from cookies
  const token: string | undefined = request.cookies.get('auth-token')?.value;

  // If accessing a protected route without a token, redirect to login
  if (!isPublicRoute && !token) {
    const loginUrl: URL = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, verify it
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: JWTPayload };
      
      // Add user info to request headers for use in API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);

      // If user is authenticated and trying to access login/register, redirect to dashboard
      if (isPublicRoute && (pathname === '/login' || pathname === '/register')) {
        const dashboardUrl: URL = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error: unknown) {
      // Invalid token, remove it and redirect to login if accessing protected route
      const response: NextResponse = isPublicRoute 
        ? NextResponse.next()
        : NextResponse.redirect(new URL('/login', request.url));
      
      response.cookies.delete('auth-token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
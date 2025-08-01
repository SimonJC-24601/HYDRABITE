import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/project', '/settings']

// Admin routes that require admin role
const adminRoutes = ['/admin']

// Public routes that should redirect authenticated users
const publicRoutes = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Handle admin routes
  if (isAdminRoute) {
    // Allow admin login page
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for admin authentication
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      if (decoded.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      jwt.verify(token, JWT_SECRET)
    } catch (error) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }
  }

  // Handle public routes (redirect authenticated users to dashboard)
  if (isPublicRoute && token) {
    try {
      jwt.verify(token, JWT_SECRET)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (error) {
      // Invalid token, clear it and continue
      const response = NextResponse.next()
      response.cookies.delete('token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    const debugInfo = {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenStart: token ? token.substring(0, 20) + '...' : null,
      jwtSecretConfigured: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      allCookies: Object.fromEntries(
        Array.from(cookieStore.getAll()).map(cookie => [cookie.name, cookie.value.substring(0, 20) + '...'])
      ),
      requestHeaders: Object.fromEntries(
        Array.from(request.headers.entries())
          .filter(([key]) => key.toLowerCase().includes('cookie') || key.toLowerCase().includes('auth'))
      )
    }

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        error: 'No token found',
        debug: debugInfo
      })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return NextResponse.json({
        authenticated: false,
        error: 'JWT_SECRET not configured',
        debug: debugInfo
      })
    }

    let decoded: JWTPayload
    try {
      decoded = verify(token, jwtSecret) as JWTPayload
      
      return NextResponse.json({
        authenticated: true,
        user: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        },
        tokenInfo: {
          issued: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null,
          expires: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null
        },
        debug: debugInfo
      })
    } catch (error) {
      return NextResponse.json({
        authenticated: false,
        error: 'Token verification failed',
        tokenError: error instanceof Error ? error.message : 'Unknown error',
        debug: debugInfo
      })
    }
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: 'Debug route error',
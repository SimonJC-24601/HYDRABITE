import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verify } from 'jsonwebtoken'

const prisma = new PrismaClient()

interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const debugInfo: Record<string, any> = {}

    // 1. Check environment variables
    debugInfo.environment = {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0,
    }

    // 2. Check cookies
    const allCookiesString = request.headers.get('cookie') || ''
    const token = request.cookies.get('token')?.value
    
    debugInfo.cookies = {
      rawCookieHeader: allCookiesString,
      parsedToken: token || null,
      tokenLength: token?.length || 0,
    }

    // 3. Test JWT verification if token exists
    if (token) {
      try {
        const jwtSecret = process.env.JWT_SECRET
        if (jwtSecret) {
          const decoded = verify(token, jwtSecret) as JWTPayload
          debugInfo.tokenVerification = {
            success: true,
            payload: decoded,
            isExpired: decoded.exp ? decoded.exp < Date.now() / 1000 : false,
          }

          // 4. Check if user exists in database
          if (decoded.userId) {
            const user = await prisma.user.findUnique({
              where: { id: decoded.userId },
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
              }
            })
            debugInfo.userInDatabase = user || 'User not found'
          }
        } else {
          debugInfo.tokenVerification = {
            success: false,
            error: 'JWT_SECRET not found'
          }
        }
      } catch (error) {
        debugInfo.tokenVerification = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    } else {
      debugInfo.tokenVerification = {
        success: false,
        error: 'No token found'
      }
    }

    // 5. Test URL and request info
    debugInfo.request = {
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host'),
    }

    // 6. Database connection test
    try {
      const userCount = await prisma.user.count()
      debugInfo.database = {
        connected: true,
        userCount: userCount,
      }
    } catch (error) {
      debugInfo.database = {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      debugInfo,
      message: 'Authentication debug complete'
    }, { status: 200 })

  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
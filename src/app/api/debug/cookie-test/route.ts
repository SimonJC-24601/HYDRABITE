import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Test reading cookies
  const existingCookie = request.cookies.get('test-cookie')?.value
  const authToken = request.cookies.get('token')?.value
  
  const response = NextResponse.json({
    message: 'Cookie test endpoint',
    timestamp: new Date().toISOString(),
    cookiesFound: {
      testCookie: existingCookie || null,
      authToken: authToken || null,
      authTokenLength: authToken?.length || 0,
    },
    allCookiesRaw: request.headers.get('cookie') || 'No cookies header',
    url: request.url,
    userAgent: request.headers.get('user-agent'),
  })

  // Set a test cookie
  response.cookies.set('test-cookie', `test-${Date.now()}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300, // 5 minutes
    path: '/'
  })

  return response
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Set a test auth token cookie to verify cookie setting works
  const testToken = `test-token-${Date.now()}`
  
  const response = NextResponse.json({
    message: 'Test cookie set',
    testToken,
    timestamp: new Date().toISOString(),
  })

  response.cookies.set('token', testToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days - same as login
    path: '/'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocol, origin, path, method, headers, body: requestBody } = body

    if (!protocol || !origin || !path || !method) {
      return NextResponse.json(
        { error: 'Missing required fields: protocol, origin, path, method' },
        { status: 400 }
      )
    }

    const url = `${protocol}://${origin}${path}`
    
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    if (requestBody && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      fetchOptions.body = JSON.stringify(requestBody)
    }

    const response = await fetch(url, fetchOptions)
    const data = await response.json()

    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error('Proxy API error:', error)
    return NextResponse.json(
      { error: 'Proxy request failed' },
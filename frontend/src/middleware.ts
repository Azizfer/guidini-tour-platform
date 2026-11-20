import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a simple admin token that we'll use for admin access
// In a production environment, this should be stored in an environment variable
const ADMIN_TOKEN = 'admin123' // Replace with a more secure token in production

export function middleware(request: NextRequest) {
  // Only apply to admin routes
  if (request.nextUrl.pathname.startsWith('/adminDashboard')) {
    // Get token from URL parameters
    const token = request.nextUrl.searchParams.get('token')
    
    if (token === ADMIN_TOKEN) {
      // If token is valid, continue to admin dashboard
      return NextResponse.next()
    }
    
    // If no valid token, redirect to home
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // For other routes, continue as normal
  return NextResponse.next()
}

export const config = {
  matcher: '/adminDashboard/:path*',
}

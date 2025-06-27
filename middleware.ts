import { NextRequest, NextResponse } from 'next/server'

// Define protected and public routes
const protectedRoutes = ['/account', '/checkout', '/orders']
const publicRoutes = ['/login', '/register', '/']
const adminRoutes = ['/admin']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route))
  
  // For admin routes, let Payload handle the authentication
  if (isAdminRoute) {
    return NextResponse.next()
  }

  // Check for session cookie (Payload's default cookie name is 'payload-token')
  const sessionCookie = req.cookies.get('payload-token')
  const hasSession = !!sessionCookie?.value

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (hasSession && (path === '/login' || path === '/register')) {
    const redirectTo = req.nextUrl.searchParams.get('redirect') || '/account'
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  return NextResponse.next()
}

// Configure which routes middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by Payload)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|icons|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.webp$|.*\\.svg$).*)' 
  ],
} 
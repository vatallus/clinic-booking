import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['vi', 'en'],
  defaultLocale: 'vi'
});

export async function middleware(req: NextRequest) {
  // First, handle internationalization
  const intlResponse = intlMiddleware(req);
  
  // Then handle authentication
  const res = intlResponse || NextResponse.next();
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  await supabase.auth.getSession()

  // Get the current path (remove locale prefix)
  const path = req.nextUrl.pathname.replace(/^\/(vi|en)/, '') || '/'

  // List of public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/']

  // If the current path is public, allow access
  if (publicPaths.includes(path)) {
    return res
  }

  // If user is not signed in and trying to access a protected route
  // redirect to login
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    const redirectUrl = req.nextUrl.clone()
    const locale = req.nextUrl.pathname.match(/^\/(vi|en)/)?.[1] || 'vi'
    redirectUrl.pathname = `/${locale}/login`
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and trying to access login/register
  // redirect to appropriate dashboard based on role
  if (session && publicPaths.includes(path)) {
    const { data: userData } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const redirectUrl = req.nextUrl.clone()
    const locale = req.nextUrl.pathname.match(/^\/(vi|en)/)?.[1] || 'vi'
    
    if (userData?.role === 'ADMIN') {
      redirectUrl.pathname = `/${locale}/admin/dashboard`
    } else if (userData?.role === 'DOCTOR') {
      redirectUrl.pathname = `/${locale}/doctor/dashboard`
    } else if (userData?.role === 'PATIENT') {
      redirectUrl.pathname = `/${locale}/patient/dashboard`
    } else {
      redirectUrl.pathname = `/${locale}/login`
    }
    
    return NextResponse.redirect(redirectUrl)
  }

  // Check user role for role-specific routes
  const { data: userData } = await supabase
    .from('User')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (path.startsWith('/admin') && userData?.role !== 'ADMIN') {
    const redirectUrl = req.nextUrl.clone()
    const locale = req.nextUrl.pathname.match(/^\/(vi|en)/)?.[1] || 'vi'
    redirectUrl.pathname = `/${locale}/login`
    return NextResponse.redirect(redirectUrl)
  }

  if (path.startsWith('/doctor') && userData?.role !== 'DOCTOR') {
    const redirectUrl = req.nextUrl.clone()
    const locale = req.nextUrl.pathname.match(/^\/(vi|en)/)?.[1] || 'vi'
    redirectUrl.pathname = `/${locale}/login`
    return NextResponse.redirect(redirectUrl)
  }

  if (path.startsWith('/patient') && userData?.role !== 'PATIENT') {
    const redirectUrl = req.nextUrl.clone()
    const locale = req.nextUrl.pathname.match(/^\/(vi|en)/)?.[1] || 'vi'
    redirectUrl.pathname = `/${locale}/login`
    return NextResponse.redirect(redirectUrl)
  }

  // Only apply to API routes
  if (req.nextUrl.pathname.startsWith('/api')) {
    // Add CORS headers
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Ensure JSON response
    res.headers.set('Content-Type', 'application/json')
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}


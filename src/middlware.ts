import { NextRequest, NextResponse } from 'next/server'
export { default } from "next-auth/middleware"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const url = request.nextUrl

  if (token &&
    (
      url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/signUp') ||
      url.pathname.startsWith('/verify') ||
      url.pathname.startsWith('/')
    )) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    '/sign-in', '/signUp', '/', '/dashboard/:path*', '/verify/:path*'
  ],
}
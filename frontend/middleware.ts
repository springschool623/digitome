// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Danh sách các đường dẫn được bảo vệ, chỉ cho phép truy cập khi đã đăng nhập
const protectedPaths = ['/dashboard', '/contacts', '/roles']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('token')?.value

  // Kiểm tra xem URL hiện tại có nằm trong protectedPaths không
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
      Match tất cả các đường dẫn ngoại trừ:
      - /login
      - /_next (Next.js static assets)
      - /favicon.ico
      - /public (nếu có route công khai)
    */
    '/((?!login|_next/static|favicon.ico|public).*)',
  ],
}

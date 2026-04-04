export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/upload/:path*', '/branches/:path*', '/partners/:path*', '/reports/:path*', '/portal/:path*'],
}

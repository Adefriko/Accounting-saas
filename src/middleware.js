import { NextResponse } from 'next/server';

/**
 * Middleware Proteksi API Backend Moneva:
 * Mencegah akses langsung ke API data keuangan (dashboard, transaksi, akun, laporan)
 * tanpa sesi login / token autentikasi yang valid.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Abaikan proteksi untuk endpoint autentikasi publik
  if (
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/auth/google')
  ) {
    return NextResponse.next();
  }

  // Proteksi seluruh endpoint API akuntansi dan dashboard
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization') || '';
    const userIdHeader = request.headers.get('x-user-id') || '';
    const sessionCookie = request.cookies.get('moneva_session')?.value || '';

    const hasBearer = authHeader.toLowerCase().startsWith('bearer ') && authHeader.length > 15;
    const hasUserId = userIdHeader && userIdHeader.trim().length > 0;
    const hasCookie = sessionCookie && sessionCookie.trim().length > 5;

    if (!hasBearer && !hasUserId && !hasCookie) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses Ditolak: Anda wajib login atau sign up terlebih dahulu untuk mengakses data keuangan.',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Headers Middleware
 * Adds OWASP-recommended security headers to every response.
 * Runs on the edge — zero latency impact on Firestore/API routes.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const headers = response.headers;

  // Prevent clickjacking — block iframe embedding from other origins
  headers.set('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // XSS protection (legacy browsers)
  headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy — send origin only on cross-origin, full on same-origin
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy — disable unnecessary browser APIs
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // HSTS — enforce HTTPS for 1 year (only set in production)
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content-Security-Policy — defense-in-depth against XSS
  // Allowing inline styles (needed for Next.js) and specific external sources
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://embed.tawk.to https://cdn.tawk.to",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://embed.tawk.to https://cdn.tawk.to",
      "font-src 'self' https://fonts.gstatic.com https://embed.tawk.to https://cdn.tawk.to",
      "img-src 'self' data: blob: https://res.cloudinary.com https://i.ytimg.com https://img.youtube.com https://*.googleusercontent.com https://embed.tawk.to https://cdn.tawk.to https://randomuser.me",
      "media-src 'self' https://res.cloudinary.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://firestore.googleapis.com https://identitytoolkit.googleapis.com wss://*.tawk.to https://va.tawk.to https://embed.tawk.to",
      "frame-src 'self' https://www.youtube.com https://*.tawk.to",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  return response;
}

// Only apply to frontend pages, not to static assets or _next internals
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|images/).*)',
  ],
};

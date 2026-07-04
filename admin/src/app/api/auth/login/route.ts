import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { apiHandler, AppError } from '@/lib/errors';
import { cookies } from 'next/headers';

// Simple in-memory rate limiter (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const record = rateLimitMap.get(ip);
  if (!record || record.expiresAt < now) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count += 1;
  return true;
}

export const POST = apiHandler(async (request: Request) => {
  // Rate limiting (IP-based brute force protection)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
  
  if (!checkRateLimit(ip)) {
    throw new AppError('Too many login attempts. Please try again in 15 minutes.', 429);
  }

  const { idToken } = await request.json();

  if (!idToken) {
    throw new AppError('Missing ID token', 400);
  }

  // Set session expiration to 5 days
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    // Create the session cookie. This will also verify the ID token in the process.
    // The session cookie will have the same claims as the ID token.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    const options = {
      name: '__session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict' as const,
    };

    const cookieStore = await cookies();
    cookieStore.set(options);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to create session cookie:', error);
    throw new AppError('Unauthorized request', 401);
  }
});

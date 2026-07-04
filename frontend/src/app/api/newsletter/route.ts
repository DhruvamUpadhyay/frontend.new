import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

// ──────────────────────────────────────────────────────────────────────
// Zod schema for newsletter subscription input
// ──────────────────────────────────────────────────────────────────────
const NewsletterSchema = z.object({
  email: z.string()
    .trim()
    .email('Invalid email address format')
    .max(254, 'Email too long')
    .transform(val => val.toLowerCase()),
});

// ──────────────────────────────────────────────────────────────────────
// CSRF origin check
// ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://forensicsbypriyanshi.com',
  'https://www.forensicsbypriyanshi.com',
];

// ──────────────────────────────────────────────────────────────────────
// Firestore-backed persistent rate limiter (survives restarts)
// FIX: Fails CLOSED — blocks requests when Firestore is unreachable
// ──────────────────────────────────────────────────────────────────────
async function checkRateLimit(ip: string): Promise<boolean> {
  const sanitizedIp = ip.replace(/[./:\\[\]]/g, '_');
  const ref = adminDb.collection('rate_limits').doc(`newsletter_${sanitizedIp}`);
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 3;

  try {
    return await adminDb.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      const data = doc.data();

      if (!data || now > data.resetTime) {
        tx.set(ref, { count: 1, resetTime: now + windowMs });
        return true; // allowed
      }

      if (data.count >= maxAttempts) {
        return false; // blocked
      }

      tx.update(ref, { count: data.count + 1 });
      return true;
    });
  } catch (err) {
    console.error('Rate limit check failed:', err);
    return false; // FAIL-CLOSED: block when Firestore is unreachable
  }
}

async function logSecurityEvent(action: string, details: Record<string, unknown>) {
  try {
    await adminDb.collection('system_logs').add({
      action,
      adminEmail: 'system',
      collectionName: 'newsletter',
      docId: '',
      timestamp: new Date().toISOString(),
      details,
    });
  } catch {
    // Non-critical — don't let logging break the request
  }
}

export async function POST(request: Request) {
  try {
    // CSRF — check Origin header
    const origin = request.headers.get('origin') || '';
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json(
        { error: 'Forbidden — cross-origin requests not allowed' },
        { status: 403 }
      );
    }

    // Persistent IP-based rate limiting via Firestore
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      await logSecurityEvent('RATE_LIMIT_BLOCKED', {
        ip,
        route: '/api/newsletter',
        reason: 'Exceeded 3 attempts per 10 minutes',
      });
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again in 10 minutes.' },
        { status: 429 }
      );
    }

    // Body size validation — newsletter payloads should never exceed 2KB
    const rawBody = await request.text();
    if (rawBody.length > 2_000) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    // Zod schema validation
    let parsed;
    try {
      const body = JSON.parse(rawBody);
      parsed = NewsletterSchema.parse(body);
    } catch (err: any) {
      if (err instanceof z.ZodError || err?.name === 'ZodError') {
        const message = err.errors?.[0]?.message || err.issues?.[0]?.message || 'Validation failed';
        return NextResponse.json(
          { error: message },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const email = parsed.email;

    // Check if already subscribed to prevent duplicate logs/db writes
    const existingDoc = await adminDb.collection('newsletter').doc(email).get();
    
    if (!existingDoc.exists) {
      await adminDb.collection('newsletter').doc(email).set({
        email,
        timestamp: new Date().toISOString(),
      });

      await logSecurityEvent('NEWSLETTER_SUBSCRIBE', { email, ip });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


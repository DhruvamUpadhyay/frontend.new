import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// ──────────────────────────────────────────────────────────────────────
// Zod schema for tracking data
// ──────────────────────────────────────────────────────────────────────
const TrackSchema = z.object({
  page: z.string().max(500).default('/'),
  referrer: z.string().max(1000).default(''),
  screenWidth: z.number().int().nonnegative().default(0),
  screenHeight: z.number().int().nonnegative().default(0),
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
// Firestore-backed persistent rate limiter (survives serverless restarts)
// FIX: Fails CLOSED — blocks requests when Firestore is unreachable
// ──────────────────────────────────────────────────────────────────────
async function checkTrackRateLimit(ip: string): Promise<boolean> {
  const sanitizedIp = ip.replace(/[./:\\[\]]/g, '_');
  const ref = adminDb.collection('rate_limits').doc(`track_${sanitizedIp}`);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxAttempts = 30; // 30 page views per minute per IP

  try {
    return await adminDb.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      const data = doc.data();

      if (!data || now > data.resetTime) {
        tx.set(ref, { count: 1, resetTime: now + windowMs });
        return true;
      }

      if (data.count >= maxAttempts) {
        return false;
      }

      tx.update(ref, { count: data.count + 1 });
      return true;
    });
  } catch (err) {
    console.error('Track rate limit check failed:', err);
    return false; // FAIL-CLOSED
  }
}

export async function POST(request: Request) {
  try {
    // CSRF origin check
    const origin = request.headers.get('origin') || '';
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Extract IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Persistent IP-based rate limiting via Firestore
    if (ip !== 'unknown') {
      const allowed = await checkTrackRateLimit(ip);
      if (!allowed) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
    }

    // Body size validation
    const rawBody = await request.text();
    if (rawBody.length > 5_000) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    // Zod schema validation
    let parsed;
    try {
      const body = JSON.parse(rawBody);
      parsed = TrackSchema.parse(body || {});
    } catch (err) {
      // Return 200 even on error — tracking should never break the user experience
      return NextResponse.json({ ok: false, error: 'Validation failed' });
    }

    const { page, referrer, screenWidth, screenHeight } = parsed;
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Parse basic device info from user-agent
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    const isTablet = /ipad|tablet/i.test(userAgent);
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    // Parse browser
    let browser = 'Other';
    if (/edg/i.test(userAgent)) browser = 'Edge';
    else if (/chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/safari/i.test(userAgent)) browser = 'Safari';
    else if (/opera|opr/i.test(userAgent)) browser = 'Opera';

    // Parse OS
    let os = 'Other';
    if (/windows/i.test(userAgent)) os = 'Windows';
    else if (/macintosh|mac os/i.test(userAgent)) os = 'macOS';
    else if (/linux/i.test(userAgent)) os = 'Linux';
    else if (/android/i.test(userAgent)) os = 'Android';
    else if (/iphone|ipad/i.test(userAgent)) os = 'iOS';

    // Attempt geolocation via free ip-api.com
    // Uses HTTPS to prevent MITM
    let geo: Record<string, string> = {};
    if (ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: AbortSignal.timeout(2000), // 2s timeout
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (!geoData.error) {
            geo = {
              country: geoData.country_name || '',
              region: geoData.region || '',
              city: geoData.city || '',
              isp: geoData.org || '',
            };
          }
        }
      } catch {
        // Geolocation failed — not critical, continue without it
      }
    }

    // Write to Firestore
    await adminDb.collection('visitor_logs').add({
      ip: ip.substring(0, 45), // truncate for safety
      page: page,
      referrer: referrer,
      userAgent: userAgent.substring(0, 500),
      deviceType,
      browser,
      os,
      screenWidth,
      screenHeight,
      geo,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Visitor tracking error:', error);
    return NextResponse.json({ ok: false });
  }
}

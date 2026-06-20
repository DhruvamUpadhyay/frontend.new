import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// A4 FIX: CSRF origin check
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://forensicsbypriyanshi.com',
  'https://www.forensicsbypriyanshi.com',
];

// A4 FIX: Firestore-backed persistent rate limiter (survives serverless restarts)
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
    return true; // fail-open
  }
}

export async function POST(request: Request) {
  try {
    // A4 FIX: CSRF origin check
    const origin = request.headers.get('origin') || '';
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Extract IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // A4 FIX: Persistent IP-based rate limiting via Firestore
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

    const body = JSON.parse(rawBody);
    const { page, referrer, screenWidth, screenHeight } = body || {};

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

    // Attempt geolocation via free ip-api.com (non-commercial use, no key needed)
    let geo: Record<string, string> = {};
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,query`, {
        signal: AbortSignal.timeout(2000), // 2s timeout to not slow down tracking
      });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.status === 'success') {
          geo = {
            country: geoData.country || '',
            region: geoData.regionName || '',
            city: geoData.city || '',
            isp: geoData.isp || '',
          };
        }
      }
    } catch {
      // Geolocation failed — not critical, continue without it
    }

    // Write to Firestore
    await adminDb.collection('visitor_logs').add({
      ip: ip.substring(0, 45), // truncate for safety
      page: (page || '/').substring(0, 500),
      referrer: (referrer || '').substring(0, 1000),
      userAgent: userAgent.substring(0, 500),
      deviceType,
      browser,
      os,
      screenWidth: screenWidth || 0,
      screenHeight: screenHeight || 0,
      geo,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Visitor tracking error:', error);
    // Return 200 even on error — tracking should never break the user experience
    return NextResponse.json({ ok: false });
  }
}

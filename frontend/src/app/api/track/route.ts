import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkIpRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  
  if (rateLimitMap.size > 3000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
    if (rateLimitMap.size > 3000) {
      rateLimitMap.clear();
    }
  }

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    // Extract IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Apply rate limit of 60 requests per 1 minute per IP
    if (ip !== 'unknown' && !checkIpRateLimit(ip, 60, 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // V10 FIX: Body size validation — tracking payloads should never exceed 5KB
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

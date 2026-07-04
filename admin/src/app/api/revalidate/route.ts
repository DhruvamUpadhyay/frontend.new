import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth-guard';

export async function POST(request: Request) {
  try {
    // 1. Verify caller is an authenticated admin
    const admin = await verifyAdmin(request);
    if (admin instanceof Response) return admin;

    // 2. Safely retrieve the private revalidation secret from env
    const revalSecret = process.env.REVALIDATION_SECRET;
    if (!revalSecret) {
      console.error('Missing REVALIDATION_SECRET in admin env');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 3. Proxy the revalidation request to all frontend domains
    const frontendOrigins = [
      'http://localhost:3000',
      'https://forensicsbypriyanshi.com',
      'https://www.forensicsbypriyanshi.com'
    ];

    const promises = frontendOrigins.map(origin => 
      fetch(`${origin}/api/revalidate?secret=${revalSecret}`, { 
        method: 'POST',
        // Next.js app router revalidate usually requires a POST/GET, 
        // we'll fire and forget without waiting for the response body
      }).catch(err => {
        console.error(`Failed to trigger revalidation on ${origin}:`, err.message);
      })
    );

    // Wait for all fetches to finish (or fail)
    await Promise.allSettled(promises);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Revalidation proxy failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

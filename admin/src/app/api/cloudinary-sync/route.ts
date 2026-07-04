import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth-guard';

export async function GET(request: Request) {
  // Server-side auth: verify token + admin role
  const admin = await verifyAdmin(request);
  if (admin instanceof Response) return admin;

  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary credentials missing' }, { status: 500 });
    }

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    // Fetch from Cloudinary Admin API
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=500`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    
    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Cloudinary API Error: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ resources: data.resources || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


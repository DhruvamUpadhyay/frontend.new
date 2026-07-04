import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAdmin } from '@/lib/auth-guard';

export async function GET(request: Request) {
  try {
    // Server-side auth: verify token + admin role via firebase-admin
    const admin = await verifyAdmin(request);
    if (admin instanceof Response) return admin;

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'fbp-cms';
    
    const timestamp = Math.round((new Date).getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!apiSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Cloudinary requires signature parameters to be sorted alphabetically
    const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    
    const signature = crypto.createHash('sha1')
      .update(stringToSign)
      .digest('hex');

    return NextResponse.json({
      timestamp,
      signature,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cloudinary signature error:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

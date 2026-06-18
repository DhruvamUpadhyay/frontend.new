import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'fbp-cms'; // Default to fbp-cms to support existing MediaManager calls
    
    const timestamp = Math.round((new Date).getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!apiSecret) {
      return NextResponse.json({ error: 'Cloudinary secret missing' }, { status: 500 });
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}

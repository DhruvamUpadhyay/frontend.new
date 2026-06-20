import { NextResponse } from 'next/server';
import crypto from 'crypto';

// V3 FIX: Verify Firebase ID token before generating signature
// V10 FIX: Also verify the user is an authorized admin (not just any authenticated user)
async function verifyFirebaseTokenAndGetPhone(token: string): Promise<string | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) return null;

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data.users) || data.users.length === 0) return null;

    // Return the phone number for admin check
    const user = data.users[0];
    return user.phoneNumber || null;
  } catch {
    return null;
  }
}

async function checkIsAdmin(phone: string): Promise<boolean> {
  // 1. Primary admin phone check
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE_NUMBER || '+919274173384';
  if (phone === adminPhone) return true;

  // 2. Check Firestore admins collection via REST (no Admin SDK needed)
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) return false;
    const encodedPhone = encodeURIComponent(phone);
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${encodedPhone}`;
    const response = await fetch(firestoreUrl);
    return response.ok; // Document exists = authorized admin
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    // V3 FIX: Require valid Firebase auth token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized — no token provided' }, { status: 401 });
    }

    // V10 FIX: Verify token AND check admin role
    const phone = await verifyFirebaseTokenAndGetPhone(token);
    if (!phone) {
      return NextResponse.json({ error: 'Unauthorized — invalid token or no phone number' }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(phone);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden — insufficient privileges' }, { status: 403 });
    }

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
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

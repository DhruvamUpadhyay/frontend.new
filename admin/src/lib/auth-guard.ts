import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from './firebase-admin';
import { cookies } from 'next/headers';

/**
 * Server-side authentication guard for API routes using HttpOnly Session Cookies.
 */
export interface VerifiedAdmin {
  uid: string;
  email: string;
  role: string;
}

const PRIMARY_ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'developer@forensicbypriyanshi.com'
).toLowerCase().trim();

export async function verifyAdmin(request: Request): Promise<VerifiedAdmin | NextResponse> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { error: 'Unauthorized — no authentication token provided' },
      { status: 401 }
    );
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Token verification failed';
    console.error('Session cookie verification failed:', message);
    return NextResponse.json(
      { error: 'Unauthorized — invalid or expired session' },
      { status: 401 }
    );
  }

  const email = decodedToken.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json(
      { error: 'Unauthorized — no email associated with this account' },
      { status: 401 }
    );
  }

  // Check if user is the primary admin
  if (email === PRIMARY_ADMIN_EMAIL) {
    return { uid: decodedToken.uid, email, role: 'Developer' };
  }

  // Check Firestore admins collection
  try {
    const adminDoc = await adminDb.collection('admins').doc(email).get();
    if (adminDoc.exists) {
      const data = adminDoc.data();
      return {
        uid: decodedToken.uid,
        email,
        role: data?.role || 'Admin',
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Admin lookup failed';
    console.error('Admin lookup failed:', message);
    return NextResponse.json(
      { error: 'Internal server error during authorization check' },
      { status: 500 }
    );
  }

  // Not an admin — deny access
  return NextResponse.json(
    { error: 'Forbidden — insufficient privileges' },
    { status: 403 }
  );
}

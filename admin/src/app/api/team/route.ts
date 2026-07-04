import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { verifyAdmin } from '@/lib/auth-guard';

export async function GET(request: Request) {
  // Server-side auth: verify token + admin role
  const admin = await verifyAdmin(request);
  if (admin instanceof Response) return admin;

  try {
    let snapshot;
    try {
      snapshot = await adminDb.collection('admins').get();
    } catch (dbErr: unknown) {
      const message = dbErr instanceof Error ? dbErr.message : 'Unknown error';
      console.error('Firestore connection failed:', message);
      return NextResponse.json({ error: 'Database connection failed. Please check your network or VPN.' }, { status: 503 });
    }

    const validAdmins = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const email = data.email || doc.id;
      
      try {
        await adminAuth.getUserByEmail(email);
        validAdmins.push({ id: doc.id, ...data });
      } catch (authErr: unknown) {
        const code = (authErr as { code?: string }).code;
        if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
          console.log(`[SYNC] Deleting stale admin from Firestore (not found in Auth): ${doc.id}`);
          await adminDb.collection('admins').doc(doc.id).delete().catch(() => {});
        } else {
          validAdmins.push({ id: doc.id, ...data });
        }
      }
    }

    return NextResponse.json(validAdmins);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to fetch/sync team members:', message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Server-side auth: verify token + Developer role required
  const admin = await verifyAdmin(request);
  if (admin instanceof Response) return admin;

  if (admin.role !== 'Developer') {
    return NextResponse.json({ error: 'Unauthorized. Only Developer can manage team.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Basic Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create User in Firebase Auth
    try {
      await adminAuth.createUser({
        email,
        password,
        displayName: name,
      });
    } catch (authError: unknown) {
      const code = (authError as { code?: string }).code;
      if (code === 'auth/email-already-exists') {
        return NextResponse.json({ error: 'Email already exists in Authentication.' }, { status: 400 });
      }
      throw authError; // rethrow other errors
    }

    // 2. Add to Firestore `admins` collection
    const adminDocRef = adminDb.collection('admins').doc(email);
    await adminDocRef.set({
      email,
      name,
      role,
      status: 'active',
      createdAt: new Date().toISOString()
    });

    // 3. Log the action (use verified admin.email, not client-sent data)
    await adminDb.collection('system_logs').add({
      action: 'CREATE',
      adminEmail: admin.email,
      collectionName: 'admins',
      docId: email,
      timestamp: new Date().toISOString(),
      details: { role, addedEmail: email }
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to add team member:', message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Server-side auth: verify token + Developer role required
  const admin = await verifyAdmin(request);
  if (admin instanceof Response) return admin;

  if (admin.role !== 'Developer') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Delete from Firebase Auth
    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      await adminAuth.deleteUser(userRecord.uid);
    } catch (authError: unknown) {
      const code = (authError as { code?: string }).code;
      if (code !== 'auth/user-not-found') {
        throw authError;
      }
      // If user not found in auth, we continue to delete from firestore anyway
    }

    // 2. Delete from Firestore
    await adminDb.collection('admins').doc(email).delete();

    // 3. Log the action (use verified admin.email)
    await adminDb.collection('system_logs').add({
      action: 'DELETE',
      adminEmail: admin.email,
      collectionName: 'admins',
      docId: email,
      timestamp: new Date().toISOString(),
      details: { deletedEmail: email }
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to delete team member:', message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  // Server-side auth: verify token + Developer role required
  const admin = await verifyAdmin(request);
  if (admin instanceof Response) return admin;

  if (admin.role !== 'Developer') {
    return NextResponse.json({ error: 'Unauthorized. Only Developer can manage team.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { oldEmail, newEmail, name, role } = body;

    if (!oldEmail || !newEmail || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update Firebase Auth
    try {
      const userRecord = await adminAuth.getUserByEmail(oldEmail);
      await adminAuth.updateUser(userRecord.uid, {
        email: newEmail,
        displayName: name,
      });
    } catch (authError: unknown) {
      const message = authError instanceof Error ? authError.message : 'Auth update failed';
      console.error('Firebase Auth update failed:', message);
      return NextResponse.json({ error: `Auth update failed: ${message}` }, { status: 400 });
    }

    // 2. Update Firestore
    if (oldEmail.toLowerCase() !== newEmail.toLowerCase()) {
      // Get existing document info if available
      const oldDoc = await adminDb.collection('admins').doc(oldEmail).get();
      const oldData = oldDoc.exists ? oldDoc.data() : {};

      // Create new document with newEmail as ID
      await adminDb.collection('admins').doc(newEmail).set({
        ...oldData,
        email: newEmail,
        name,
        role,
        status: 'active',
        updatedAt: new Date().toISOString()
      });

      // Delete old document
      await adminDb.collection('admins').doc(oldEmail).delete();
    } else {
      // Just update existing document
      await adminDb.collection('admins').doc(oldEmail).update({
        name,
        role,
        updatedAt: new Date().toISOString()
      });
    }

    // 3. Log the action (use verified admin.email)
    await adminDb.collection('system_logs').add({
      action: 'UPDATE',
      adminEmail: admin.email,
      collectionName: 'admins',
      docId: newEmail,
      timestamp: new Date().toISOString(),
      details: { oldEmail, newEmail, name, role }
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to update team member:', message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

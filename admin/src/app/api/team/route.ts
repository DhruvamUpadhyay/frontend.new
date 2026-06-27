import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    let snapshot;
    try {
      snapshot = await adminDb.collection('admins').get();
    } catch (dbErr: any) {
      console.error('Firestore connection failed:', dbErr);
      return NextResponse.json({ error: 'Database connection failed. Please check your network or VPN.' }, { status: 503 });
    }

    const validAdmins = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const email = data.email || doc.id;
      
      try {
        await adminAuth.getUserByEmail(email);
        validAdmins.push({ id: doc.id, ...data });
      } catch (authErr: any) {
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-email') {
          console.log(`[SYNC] Deleting stale admin from Firestore (not found in Auth): ${doc.id}`);
          await adminDb.collection('admins').doc(doc.id).delete().catch(() => {});
        } else {
          validAdmins.push({ id: doc.id, ...data });
        }
      }
    }

    return NextResponse.json(validAdmins);
  } catch (err: any) {
    console.error('Failed to fetch/sync team members:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, adminEmail } = body;

    // Basic Validation
    if (!email || !password || !name || !role || !adminEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Security check: Only the Developer can add admins
    const devEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'developer@forensicbypriyanshi.com';
    if (adminEmail !== devEmail) {
      return NextResponse.json({ error: 'Unauthorized. Only Developer can manage team.' }, { status: 403 });
    }

    // 1. Create User in Firebase Auth
    try {
      await adminAuth.createUser({
        email,
        password,
        displayName: name,
      });
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-exists') {
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

    // 3. Log the action
    await adminDb.collection('system_logs').add({
      action: 'CREATE',
      adminEmail,
      collectionName: 'admins',
      docId: email,
      timestamp: new Date().toISOString(),
      details: { role, addedEmail: email }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to add team member:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const adminEmail = searchParams.get('adminEmail');

    if (!email || !adminEmail) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const devEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'developer@forensicbypriyanshi.com';
    if (adminEmail !== devEmail) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    // 1. Delete from Firebase Auth
    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      await adminAuth.deleteUser(userRecord.uid);
    } catch (authError: any) {
      if (authError.code !== 'auth/user-not-found') {
        throw authError;
      }
      // If user not found in auth, we continue to delete from firestore anyway
    }

    // 2. Delete from Firestore
    await adminDb.collection('admins').doc(email).delete();

    // 3. Log the action
    await adminDb.collection('system_logs').add({
      action: 'DELETE',
      adminEmail,
      collectionName: 'admins',
      docId: email,
      timestamp: new Date().toISOString(),
      details: { deletedEmail: email }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete team member:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { oldEmail, newEmail, name, role, adminEmail } = body;

    if (!oldEmail || !newEmail || !name || !role || !adminEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const devEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'developer@forensicbypriyanshi.com';
    if (adminEmail !== devEmail) {
      return NextResponse.json({ error: 'Unauthorized. Only Developer can manage team.' }, { status: 403 });
    }

    // 1. Update Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(oldEmail);
      await adminAuth.updateUser(userRecord.uid, {
        email: newEmail,
        displayName: name,
      });
    } catch (authError: any) {
      console.error('Firebase Auth update failed:', authError);
      return NextResponse.json({ error: `Auth update failed: ${authError.message}` }, { status: 400 });
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

    // 3. Log the action
    await adminDb.collection('system_logs').add({
      action: 'UPDATE',
      adminEmail,
      collectionName: 'admins',
      docId: newEmail,
      timestamp: new Date().toISOString(),
      details: { oldEmail, newEmail, name, role }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to update team member:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


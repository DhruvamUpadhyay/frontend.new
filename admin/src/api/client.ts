import { auth, db } from '../config/firebase';
import {
  collection, getDocs, doc, addDoc, updateDoc, deleteDoc,
  getDoc, setDoc, query, orderBy, limit as firestoreLimit,
} from 'firebase/firestore';

// ──────────────────────────────────────────────────────────────────────
// Audit Log Helper — writes to `system_logs` collection
// ──────────────────────────────────────────────────────────────────────
async function logAction(
  action: string,
  collectionName: string,
  docId: string,
  details?: Record<string, unknown>
) {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, 'system_logs'), {
      action,
      adminEmail: user?.email || user?.phoneNumber || 'unknown',
      collectionName,
      docId,
      timestamp: new Date().toISOString(),
      details: details || {},
    });
  } catch (err) {
    // Non-critical — don't let logging break the primary operation
    console.warn('Failed to write audit log:', err);
  }
}

async function updateSyncTimestamp(collectionName: string) {
  const ignore = ['system_logs', 'rate_limits', 'visitor_logs', 'admins'];
  if (ignore.includes(collectionName)) return;

  try {
    const now = Date.now();
    const syncRef = doc(db, 'settings', 'sync');
    await setDoc(syncRef, {
      lastUpdated: now,
      [`collections.${collectionName}`]: now
    }, { merge: true });

    // Trigger next.js revalidation via our secure proxy route
    fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ collection: collectionName })
    }).catch(() => {});
  } catch (err) {
    console.warn('Failed to update sync tracking document:', err);
  }
}

export const apiClient = {
  // V9 FIX: Added optional maxDocs parameter with default limit of 100
  async get(collectionName: string, maxDocs = 100) {
    const q = query(
      collection(db, collectionName),
      firestoreLimit(maxDocs)
    );
    const querySnapshot = await getDocs(q);
    const items: any[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    // Optional sorting by createdAt if it exists
    items.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime();
      const bTime = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
    return items;
  },

  async post(collectionName: string, data: any) {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const newDoc = await getDoc(docRef);

    // Audit log
    await logAction('CREATE', collectionName, newDoc.id, {
      title: data.title || data.name || '',
    });

    // Update sync tracking
    await updateSyncTimestamp(collectionName);

    return { id: newDoc.id, ...newDoc.data() };
  },

  async put(collectionName: string, id: string, data: any) {
    const docRef = doc(db, collectionName, id);
    // Use setDoc with merge: true instead of updateDoc, so it creates the document if it doesn't exist
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Audit log
    await logAction('UPDATE', collectionName, id, {
      title: data.title || data.name || '',
    });

    // Update sync tracking
    await updateSyncTimestamp(collectionName);

    return { id, ...data };
  },

  async delete(collectionName: string, id: string) {
    await deleteDoc(doc(db, collectionName, id));

    // Audit log
    await logAction('DELETE', collectionName, id);

    // Update sync tracking
    await updateSyncTimestamp(collectionName);

    return { success: true };
  },
  
  // V3 FIX: Pass Firebase ID token for authenticated Cloudinary signature requests (Now handled by Session Cookie)
  async getCloudinarySignature(folder?: string) {
    const url = folder ? `/api/cloudinary-signature?folder=${encodeURIComponent(folder)}` : '/api/cloudinary-signature';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to get signature');
    return res.json();
  }
};

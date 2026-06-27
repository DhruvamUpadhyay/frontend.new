import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail } = body;

    if (!adminEmail) {
      return NextResponse.json({ error: 'Unauthorized. Admin email required.' }, { status: 400 });
    }

    const snapshot = await adminDb.collection('newsletter').get();
    
    // Group docs by normalized lowercase email
    const emailGroups: Record<string, any[]> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const rawEmail = data.email || doc.id;
      if (rawEmail) {
        const normEmail = rawEmail.trim().toLowerCase();
        if (!emailGroups[normEmail]) {
          emailGroups[normEmail] = [];
        }
        emailGroups[normEmail].push({ id: doc.id, ...data });
      }
    });

    let duplicateCount = 0;
    const batch = adminDb.batch();

    // Iterate groups and delete extra documents
    for (const [normEmail, docs] of Object.entries(emailGroups)) {
      if (docs.length > 1) {
        // Keep the first document, delete the rest
        const keepDoc = docs[0];
        const toDelete = docs.slice(1);
        
        toDelete.forEach(docToDelete => {
          const docRef = adminDb.collection('newsletter').doc(docToDelete.id);
          batch.delete(docRef);
          duplicateCount++;
        });
      }
    }

    if (duplicateCount > 0) {
      await batch.commit();
      
      // Log the deduplication action
      await adminDb.collection('system_logs').add({
        action: 'CLEANUP_NEWSLETTER',
        adminEmail,
        collectionName: 'newsletter',
        timestamp: new Date().toISOString(),
        details: { removedDuplicates: duplicateCount }
      });
    }

    return NextResponse.json({ success: true, removedCount: duplicateCount });
  } catch (err: any) {
    console.error('Failed to deduplicate newsletter subscribers:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

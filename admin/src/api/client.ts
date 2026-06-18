import { auth, db } from '../config/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';

export const apiClient = {
  async get(collectionName: string) {
    const querySnapshot = await getDocs(collection(db, collectionName));
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
    return { id: newDoc.id, ...newDoc.data() };
  },

  async put(collectionName: string, id: string, data: any) {
    const docRef = doc(db, collectionName, id);
    // Use setDoc with merge: true instead of updateDoc, so it creates the document if it doesn't exist
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { id, ...data };
  },

  async delete(collectionName: string, id: string) {
    await deleteDoc(doc(db, collectionName, id));
    return { success: true };
  },
  
  async getCloudinarySignature() {
    const res = await fetch('/api/cloudinary-signature');
    if (!res.ok) throw new Error('Failed to get signature');
    return res.json();
  }
};

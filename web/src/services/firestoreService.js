import { db } from '@/src/firebase/firebase'
import { collection, addDoc, getDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'

export const firestoreService = {
  addDocument: async (collectionName, data) => {
    const ref = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },
  getDocument: async (collectionName, docId) => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },
  updateDocument: async (collectionName, docId, data) => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },
  deleteDocument: async (collectionName, docId) => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  }
};

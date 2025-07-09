import { db } from '@/src/firebase/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function subscribeToAnswersByRequestId(requestId, callback) {
  const q = query(collection(db, 'answers'), where('requestId', '==', requestId));
  return onSnapshot(q, (snapshot) => {
    const answers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(answers);
  });
} 
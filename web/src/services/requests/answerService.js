import { db } from '@/src/firebase/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

export function subscribeToAnswersByRequestId(requestId, callback) {
  const q = query(collection(db, 'answers'), where('requestId', '==', requestId));
  return onSnapshot(q, (snapshot) => {
    const answers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(answers);
  });
}

export async function submitAnswer(answerData) {
  const newAnswer = {
    ...answerData,
    createdAt: serverTimestamp(),
    upvotes: 0,
    isHelpful: false,
  };
  const docRef = await addDoc(collection(db, 'answers'), newAnswer);
  return { id: docRef.id, ...newAnswer };
}

export async function submitReply(answerId, replyData) {
  // Implement reply logic if needed
  // Placeholder for now
  return Promise.resolve();
} 
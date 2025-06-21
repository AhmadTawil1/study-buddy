import { db } from '@/src/firebase/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export async function getSearchSuggestions(value) {
  const requestsRef = collection(db, 'requests');
  const q1 = query(
    requestsRef,
    where('title', '>=', value),
    where('title', '<=', value + '\uf8ff'),
    orderBy('title'),
    limit(5)
  );
  const querySnapshot = await getDocs(q1);
  const requestSuggestions = querySnapshot.docs.map(doc => doc.data().title);

  const topicsRef = collection(db, 'topics');
  const q2 = query(
    topicsRef,
    where('name', '>=', value),
    where('name', '<=', value + '\uf8ff'),
    orderBy('name'),
    limit(3)
  );
  const topicsSnapshot = await getDocs(q2);
  const topicSuggestions = topicsSnapshot.docs.map(doc => doc.data().name);

  // Combine and deduplicate suggestions
  return [...new Set([...requestSuggestions, ...topicSuggestions])];
} 
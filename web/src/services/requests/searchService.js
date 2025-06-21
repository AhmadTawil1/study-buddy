import { db } from '@/src/firebase/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const buildSearchQuery = (collectionName, field, value, limitNum) => 
  query(
    collection(db, collectionName),
    where(field, '>=', value),
    where(field, '<=', value + '\uf8ff'),
    orderBy(field),
    limit(limitNum)
  );

export async function getSearchSuggestions(value) {
  const [requestsSnap, topicsSnap] = await Promise.all([
    getDocs(buildSearchQuery('requests', 'title', value, 5)),
    getDocs(buildSearchQuery('topics', 'name', value, 3))
  ]);
  
  const requestSuggestions = requestsSnap.docs.map(doc => doc.data().title);
  const topicSuggestions = topicsSnap.docs.map(doc => doc.data().name);
  
  return [...new Set([...requestSuggestions, ...topicSuggestions])];
} 
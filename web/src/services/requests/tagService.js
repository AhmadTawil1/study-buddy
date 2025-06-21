import { db } from '@/src/firebase/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export function subscribeToPopularTags(callback) {
  const unsub = onSnapshot(collection(db, 'requests'), (snapshot) => {
    const tagCount = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (Array.isArray(data.tags)) {
        data.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    const tagsSorted = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    callback(tagsSorted);
  });
  return unsub;
} 
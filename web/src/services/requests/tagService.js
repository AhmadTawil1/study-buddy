import { db } from '@/src/firebase/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// Helper to count and sort tags by frequency
const processTags = (docs, limit = 5) => {
  const tagCount = {};
  docs.forEach(doc => {
    const tags = doc.data().tags || [];
    tags.forEach(tag => tagCount[tag] = (tagCount[tag] || 0) + 1);
  });
  
  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .slice(0, limit) // Limit to top N
    .map(([name, count]) => ({ name, count }));
};

// Subscribe to the top 5 most popular tags in the 'requests' collection
export function subscribeToPopularTags(callback) {
  return onSnapshot(collection(db, 'requests'), (snapshot) => {
    callback(processTags(snapshot.docs, 5));
  });
}

// Subscribe to all unique tags in the 'requests' collection
export function subscribeToAvailableTags(callback) {
  return onSnapshot(collection(db, 'requests'), (snapshot) => {
    const tagSet = new Set();
    snapshot.docs.forEach(doc => {
      const tags = doc.data().tags || [];
      tags.forEach(tag => tagSet.add(tag));
    });
    callback(Array.from(tagSet).sort());
  });
} 
import { db } from '@/src/firebase/firebase';
import { collection, onSnapshot, getDocs, query, where } from 'firebase/firestore';

// Helper to count and sort contributors by answer count
const processContributors = (docs) => {
  const contributorCount = {};
  docs.forEach(doc => {
    const authorName = doc.data().authorName || doc.data().author;
    if (authorName && authorName !== 'Unknown' && authorName !== 'AI Assistant') {
      contributorCount[authorName] = (contributorCount[authorName] || 0) + 1;
    }
  });
  
  return Object.entries(contributorCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([email, count]) => ({ email, count }));
};

// Fetch user data (name, nickname, id) for a list of emails
const fetchUserData = async (emails) => {
  if (emails.length === 0) return {};
  
  const usersQuery = query(collection(db, 'users'), where('email', 'in', emails));
  const usersSnapshot = await getDocs(usersQuery);
  
  const userDataMap = {};
  usersSnapshot.docs.forEach(doc => {
    const data = doc.data();
    userDataMap[data.email] = { name: data.name, nickname: data.nickname, id: doc.id };
  });
  
  return userDataMap;
};

// Subscribe to the top 5 contributors (by answer count) in the 'answers' collection
export function subscribeToTopContributors(callback) {
  return onSnapshot(collection(db, 'answers'), async (snapshot) => {
    const contributors = processContributors(snapshot.docs);
    
    if (contributors.length === 0) {
      callback([]);
      return;
    }
    
    const emails = contributors.map(c => c.email);
    const userDataMap = await fetchUserData(emails);
    
    const topContributors = contributors.map(item => {
      const userData = userDataMap[item.email];
      const displayName = userData?.nickname || userData?.name || item.email;
      return { name: displayName, answers: item.count, userId: userData?.id };
    });
    
    callback(topContributors);
  });
} 
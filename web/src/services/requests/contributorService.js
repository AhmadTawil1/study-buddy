import { db } from '@/src/firebase/firebase';
import { collection, onSnapshot, getDocs, query, where } from 'firebase/firestore';

export function subscribeToTopContributors(callback) {
  const unsub = onSnapshot(collection(db, 'answers'), async (snapshot) => {
    const contributorCount = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const authorName = data.authorName || data.author;
      if (authorName && authorName !== 'Unknown' && authorName !== 'AI Assistant') {
        contributorCount[authorName] = (contributorCount[authorName] || 0) + 1;
      }
    });
    const sortedContributorEmails = Object.entries(contributorCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([email, count]) => ({ email, count }));
    if (sortedContributorEmails.length === 0) {
      callback([]);
      return;
    }
    const topContributorEmails = sortedContributorEmails.map(item => item.email);
    const usersRef = collection(db, 'users');
    if (topContributorEmails.length > 0) {
      const usersQuery = query(usersRef, where('email', 'in', topContributorEmails));
      const usersSnapshot = await getDocs(usersQuery);
      const userDataMap = {};
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        userDataMap[data.email] = { name: data.name, nickname: data.nickname, id: doc.id };
      });
      const topContributorsWithNames = sortedContributorEmails.map(item => {
        const userData = userDataMap[item.email];
        const displayName = userData?.nickname || userData?.name || item.email;
        return { name: displayName, answers: item.count, userId: userData?.id };
      });
      callback(topContributorsWithNames);
    }
  });
  return unsub;
} 
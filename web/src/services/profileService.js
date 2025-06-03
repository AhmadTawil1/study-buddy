import { db } from '@/src/firebase/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const profileService = {
  getUserProfile: async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  },
  getUserQuestions: async (userId) => {
    const questionsQuery = query(collection(db, 'requests'), where('userId', '==', userId));
    const questionsSnap = await getDocs(questionsQuery);
    return questionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  getUserAnswers: async (userId, userEmail) => {
    // Fetch answers by userId or author/authorEmail
    const answersRef = collection(db, 'answers');
    const q1 = query(answersRef, where('userId', '==', userId));
    const q2 = query(answersRef, where('author', '==', userEmail));
    const q3 = query(answersRef, where('authorEmail', '==', userEmail));
    const [snap1, snap2, snap3] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
      getDocs(q3)
    ]);
    // Merge and deduplicate answers by id
    const allAnswers = [...snap1.docs, ...snap2.docs, ...snap3.docs];
    const uniqueAnswers = Object.values(
      allAnswers.reduce((acc, doc) => {
        acc[doc.id] = { id: doc.id, ...doc.data() };
        return acc;
      }, {})
    );
    return uniqueAnswers;
  },
  getUserSavedQuestions: async (userId) => {
    const savedQuery = query(collection(db, 'savedQuestions'), where('userId', '==', userId));
    const savedSnap = await getDocs(savedQuery);
    return savedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  getUserStats: async (userId, userEmail) => {
    // Fetch answers for upvotes and ratings (by userId or author/authorEmail)
    const answersRef = collection(db, 'answers');
    const q1 = query(answersRef, where('userId', '==', userId));
    const q2 = query(answersRef, where('author', '==', userEmail));
    const q3 = query(answersRef, where('authorEmail', '==', userEmail));
    const [snap1, snap2, snap3] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
      getDocs(q3)
    ]);
    // Merge and deduplicate answers by id
    const allAnswers = [...snap1.docs, ...snap2.docs, ...snap3.docs];
    const uniqueAnswers = Object.values(
      allAnswers.reduce((acc, doc) => {
        acc[doc.id] = doc;
        return acc;
      }, {})
    );
    let upvotes = 0;
    let totalRating = 0;
    let ratingCount = 0;
    uniqueAnswers.forEach(doc => {
      const data = doc.data ? doc.data() : doc;
      upvotes += data.upvotes || 0;
      if (Array.isArray(data.ratings)) {
        data.ratings.forEach(r => {
          totalRating += r;
          ratingCount++;
        });
      }
    });
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
    // Calculate rank (by upvotes)
    const usersSnap = await getDocs(collection(db, 'users'));
    const allUserUpvotes = [];
    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const userAnswersQuery = query(collection(db, 'answers'), where('userId', '==', userId));
      const userAnswersSnap = await getDocs(userAnswersQuery);
      let userUpvotes = 0;
      userAnswersSnap.docs.forEach(ansDoc => {
        userUpvotes += ansDoc.data().upvotes || 0;
      });
      allUserUpvotes.push({ userId, upvotes: userUpvotes });
    }
    allUserUpvotes.sort((a, b) => b.upvotes - a.upvotes);
    const rank = allUserUpvotes.findIndex(u => u.userId === userId) + 1;
    return {
      questionsAsked: 0, // to be set in component
      questionsAnswered: uniqueAnswers.length,
      upvotesEarned: upvotes,
      averageRating,
      rank
    };
  }
}; 
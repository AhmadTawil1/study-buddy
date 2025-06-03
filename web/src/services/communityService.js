import { db } from '@/src/firebase/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  getCountFromServer
} from 'firebase/firestore';

export const communityService = {
  // Get community statistics
  getCommunityStats: async () => {
    const stats = {
      totalUsers: 0,
      totalQuestions: 0,
      totalAnswers: 0,
      activeUsers: 0
    };

    // Get total users
    const usersRef = collection(db, 'users');
    const usersCount = await getCountFromServer(usersRef);
    stats.totalUsers = usersCount.data().count;

    // Get total questions
    const questionsRef = collection(db, 'questions');
    const questionsCount = await getCountFromServer(questionsRef);
    stats.totalQuestions = questionsCount.data().count;

    // Get total answers
    const answersRef = collection(db, 'answers');
    const answersCount = await getCountFromServer(answersRef);
    stats.totalAnswers = answersCount.data().count;

    // Get active users (users who have posted in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersQuery = query(
      usersRef,
      where('lastActive', '>=', thirtyDaysAgo)
    );
    const activeUsersCount = await getCountFromServer(activeUsersQuery);
    stats.activeUsers = activeUsersCount.data().count;

    return stats;
  },

  // Get trending topics
  getTrendingTopics: async (limit = 5) => {
    const topicsRef = collection(db, 'topics');
    const q = query(
      topicsRef,
      orderBy('postCount', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get latest questions
  getLatestQuestions: async (limit = 5) => {
    const questionsRef = collection(db, 'questions');
    const q = query(
      questionsRef,
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get top helpers
  getTopHelpers: async (limit = 5) => {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy('helpfulAnswers', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get featured subjects
  getFeaturedSubjects: async (limit = 5) => {
    const subjectsRef = collection(db, 'subjects');
    const q = query(
      subjectsRef,
      where('isFeatured', '==', true),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}; 
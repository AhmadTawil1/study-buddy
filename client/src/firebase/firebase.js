// src/firebase/firebase.js

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth }  from 'firebase/auth'
import { getFirestore, collection, query, orderBy, limit, getDocs, where, Timestamp }  from 'firebase/firestore'
import { isSupported, getAnalytics } from 'firebase/analytics'  // optional

// 1️ Read config from env vars — never hardcode!
const firebaseConfig = {
  apiKey:               process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:           process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:     process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:                process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId:        process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // optional
}

// 2️ Initialize (or reuse) the Firebase app
const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig)

// 3️ Export Auth and Firestore instances
export const auth = getAuth(app)
export const db   = getFirestore(app)

// 4️ (Optional) Initialize Analytics only in the browser if supported
export let analytics = null
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app)
  })
}

// Utility functions for fetching data
export const fetchLatestQuestions = async () => {
  try {
    const questionsRef = collection(db, 'questions')
    const q = query(questionsRef, orderBy('createdAt', 'desc'), limit(3))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))
  } catch (error) {
    console.error('Error fetching latest questions:', error)
    return []
  }
}

export const fetchTopHelpers = async () => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('isHelper', '==', true),
      orderBy('rating', 'desc'),
      limit(3)
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching top helpers:', error)
    return []
  }
}

export const fetchFeaturedSubjects = async () => {
  try {
    const subjectsRef = collection(db, 'subjects')
    const q = query(subjectsRef, orderBy('questionCount', 'desc'), limit(4))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching featured subjects:', error)
    return []
  }
}

export const fetchCommunityStats = async () => {
  try {
    // Fetch total users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const totalUsers = usersSnapshot.size;

    // Fetch active helpers (assuming 'isHelper' field)
    const activeHelpersQuery = query(usersRef, where('isHelper', '==', true));
    const activeHelpersSnapshot = await getDocs(activeHelpersQuery);
    const activeHelpers = activeHelpersSnapshot.size;

    // Fetch questions this week
    const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const questionsRef = collection(db, 'requests');
    const recentQuestionsQuery = query(
      questionsRef,
      where('createdAt', '>=', sevenDaysAgo)
    );
    const recentQuestionsSnapshot = await getDocs(recentQuestionsQuery);
    const questionsThisWeek = recentQuestionsSnapshot.size;

    // Note: 'Users Helped' is ambiguous, using total users for now.
    // If 'Users Helped' means something else (e.g., users who received an answer),
    // further logic would be needed.

    return {
      usersHelped: totalUsers,
      questionsThisWeek: questionsThisWeek,
      activeHelpers: activeHelpers
    };
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return {
      usersHelped: 0,
      questionsThisWeek: 0,
      activeHelpers: 0
    };
  }
}

export const fetchTrendingTopics = async () => {
  try {
    const requestsRef = collection(db, 'requests');
    const querySnapshot = await getDocs(requestsRef);

    const tagCount = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (Array.isArray(data.tags)) {
        data.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    // Get top 8 most frequent tags as trending topics
    const trendingTopics = Object.entries(tagCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 8)
      .map(([tag,]) => tag);

    return trendingTopics;
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return [];
  }
}

// src/firebase/queries.js

import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  Timestamp, 
  startAfter
} from 'firebase/firestore'
import { db } from './firebase'

// Constants
const COLLECTIONS = {
  REQUESTS: 'requests',
  ANSWERS: 'answers',
  USERS: 'users',
  SUBJECTS: 'subjects'
}

const LIMITS = {
  LATEST_QUESTIONS: 3,
  FEATURED_SUBJECTS: 4,
  TOP_HELPERS: 3,
  TRENDING_TOPICS: 8
}

/**
 * Custom error class for Firebase operations
 */
class FirebaseError extends Error {
  constructor(message, originalError) {
    super(message)
    this.name = 'FirebaseError'
    this.originalError = originalError
  }
}

/**
 * Fetches the latest questions from the requests collection with pagination
 * @param {number} pageLimit - Number of questions to fetch
 * @param {object} startAfterDoc - The last document from the previous page
 * @returns {Promise<{questions: Array, lastDoc: object}>}
 */
export const fetchLatestQuestions = async (pageLimit = LIMITS.LATEST_QUESTIONS, startAfterDoc = null) => {
  try {
    const questionsRef = collection(db, COLLECTIONS.REQUESTS)
    let q = query(
      questionsRef,
      orderBy('createdAt', 'desc'),
      limit(pageLimit)
    )
    if (startAfterDoc) {
      q = query(
        questionsRef,
        orderBy('createdAt', 'desc'),
        startAfter(startAfterDoc),
        limit(pageLimit) 
      )
    }
    const querySnapshot = await getDocs(q)
    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))
    const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null
    
    return { questions, lastDoc }
  } catch (error) {
    console.error('Error fetching latest questions:', error)
    // Return empty data instead of throwing error for better UX
    return { questions: [], lastDoc: null }
  }
}

/**
 * Fetches top helpers based on their answer contributions
 * @returns {Promise<Array>} Array of helper objects with their stats
 */
export const fetchTopHelpers = async () => {
  try {
    const answersRef = collection(db, COLLECTIONS.ANSWERS)
    const querySnapshot = await getDocs(answersRef)

    // Count contributions per userId (UID)
    const contributorCount = {}
    querySnapshot.docs.forEach(doc => {
      const data = doc.data()
      // Exclude AI Assistant by userId, author, or authorName
      const isAI = data.author === 'AI Assistant' || data.authorName === 'AI Assistant' || data.userId === 'ai-bot'
      if (isAI) return
      const userId = data.userId
      if (userId) {
        contributorCount[userId] = (contributorCount[userId] || 0) + 1
      }
    })

    // Get top contributors by UID
    const sortedContributorUids = Object.entries(contributorCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, LIMITS.TOP_HELPERS)
      .map(([uid, count]) => ({ uid, count }))

    if (sortedContributorUids.length === 0) {
      return []
    }

    // Fetch user details for top contributors
    const topContributorUids = sortedContributorUids.map(item => item.uid)
    const usersRef = collection(db, COLLECTIONS.USERS)
    const usersQuery = query(usersRef, where('__name__', 'in', topContributorUids))
    const usersSnapshot = await getDocs(usersQuery)

    // Map user data
    const userDataMap = {}
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data()
      userDataMap[doc.id] = {
        userId: doc.id,
        displayName: data.nickname || data.name || data.email || doc.id,
        subjects: data.subjects || []
      }
    })

    // Combine data
    return sortedContributorUids
      .map(item => ({
        id: userDataMap[item.uid]?.userId,
        displayName: userDataMap[item.uid]?.displayName || item.uid,
        subjects: userDataMap[item.uid]?.subjects || [],
        answers: item.count
      }))
      .filter(helper => !!helper.id)
  } catch (error) {
    console.error('Error fetching top helpers:', error)
    // Return empty array instead of throwing error for better UX
    return []
  }
}

/**
 * Fetches community statistics
 * @returns {Promise<Object>} Object containing community stats
 */
export const fetchCommunityStats = async () => {
  try {
    // Count users
    const usersRef = collection(db, COLLECTIONS.USERS)
    const usersSnapshot = await getDocs(usersRef)
    const totalUsers = usersSnapshot.size

    // Count requests (questions)
    const requestsRef = collection(db, COLLECTIONS.REQUESTS)
    const requestsSnapshot = await getDocs(requestsRef)
    const totalQuestions = requestsSnapshot.size

    // Count answers
    const answersRef = collection(db, COLLECTIONS.ANSWERS)
    const answersSnapshot = await getDocs(answersRef)
    const totalAnswers = answersSnapshot.size

    return {
      users: totalUsers,
      questions: totalQuestions,
      answers: totalAnswers
    }
  } catch (error) {
    throw new FirebaseError('Error fetching community stats', error)
  }
}

/**
 * Fetches trending topics based on tag frequency
 * @returns {Promise<Array>} Array of trending topic strings
 */
export const fetchTrendingTopics = async () => {
  try {
    const requestsRef = collection(db, COLLECTIONS.REQUESTS)
    const querySnapshot = await getDocs(requestsRef)

    const tagCount = {}
    querySnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (Array.isArray(data.tags)) {
        data.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      }
    })

    return Object.entries(tagCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, LIMITS.TRENDING_TOPICS)
      .map(([tag]) => tag)
  } catch (error) {
    throw new FirebaseError('Error fetching trending topics', error)
  }
}

/**
 * Builds a Firestore query for requests based on filters, sorting, and search.
 * @param {string} collectionName - The name of the collection to query.
 * @param {object} filters - Filtering options.
 * @param {string} sortBy - Field to sort by.
 * @param {string} searchQuery - Text to search for in the title.
 * @param {object} lastDoc - The last document from the previous page for pagination.
 * @param {number} limitNum - The number of documents to limit.
 * @returns {Query} A Firestore query object.
 */
export const buildQuery = (collectionName, filters = {}, sortBy = 'createdAt', searchQuery = '', lastDoc = null, limitNum = null) => {
  let q = query(collection(db, collectionName));
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && key !== 'timeRange' && key !== 'unanswered') {
      q = query(q, where(key, '==', value));
    }
  });
  
  // Time range filter
  if (filters.timeRange && filters.timeRange !== 'all') {
    const timeRanges = { '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
    const fromDate = Timestamp.fromDate(new Date(Date.now() - timeRanges[filters.timeRange]));
    q = query(q, where('createdAt', '>=', fromDate));
  }
  
  // Search query
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    q = query(q, where('title_lowercase', '>=', lowerQuery), where('title_lowercase', '<=', lowerQuery + '~ '));
  }
  
  // Sorting
  const sortField = sortBy === 'most_answered' ? 'answersCount' : 'createdAt';
  q = query(q, orderBy(sortField, 'desc'));
  
  // Pagination
  if (lastDoc) q = query(q, startAfter(lastDoc));
  if (limitNum) q = query(q, limit(limitNum));
  
  return q;
};



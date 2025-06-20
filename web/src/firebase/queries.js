// src/firebase/queries.js

import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  Timestamp, 
  doc, 
  updateDoc,
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
    
    // If no questions found, return mock data for demo purposes
    if (questions.length === 0) {
      const mockQuestions = [
        {
          id: 'demo-1',
          title: 'How to solve quadratic equations?',
          subject: 'Mathematics',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          id: 'demo-2',
          title: 'Understanding Newton\'s laws of motion',
          subject: 'Physics',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
        },
        {
          id: 'demo-3',
          title: 'JavaScript async/await best practices',
          subject: 'Computer Science',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
        }
      ]
      return { questions: mockQuestions, lastDoc: null }
    }
    
    return { questions, lastDoc }
  } catch (error) {
    // Return mock data on error for demo purposes
    const mockQuestions = [
      {
        id: 'demo-1',
        title: 'How to solve quadratic equations?',
        subject: 'Mathematics',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'demo-2',
        title: 'Understanding Newton\'s laws of motion',
        subject: 'Physics',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: 'demo-3',
        title: 'JavaScript async/await best practices',
        subject: 'Computer Science',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ]
    return { questions: mockQuestions, lastDoc: null }
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

    // Count contributions per user
    const contributorCount = {}
    querySnapshot.docs.forEach(doc => {
      const data = doc.data()
      const authorEmail = data.author || data.authorName || 'Unknown'
      if (authorEmail !== 'Unknown') {
        contributorCount[authorEmail] = (contributorCount[authorEmail] || 0) + 1
      }
    })

    // Get top contributors
    const sortedContributorEmails = Object.entries(contributorCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, LIMITS.TOP_HELPERS)
      .map(([email, count]) => ({ email, count }))

    if (sortedContributorEmails.length === 0) {
      // Return mock data if no helpers found
      return [
        {
          id: 'demo-helper-1',
          displayName: 'Sarah Johnson',
          subjects: ['Mathematics', 'Physics'],
          rating: 4.8,
          answers: 12
        },
        {
          id: 'demo-helper-2',
          displayName: 'Mike Chen',
          subjects: ['Computer Science', 'Chemistry'],
          rating: 4.6,
          answers: 8
        },
        {
          id: 'demo-helper-3',
          displayName: 'Emma Davis',
          subjects: ['Biology', 'Mathematics'],
          rating: 4.9,
          answers: 15
        }
      ]
    }

    // Fetch user details for top contributors
    const topContributorEmails = sortedContributorEmails.map(item => item.email)
    const usersRef = collection(db, COLLECTIONS.USERS)
    const usersQuery = query(usersRef, where('email', 'in', topContributorEmails))
    const usersSnapshot = await getDocs(usersQuery)

    // Map user data
    const userDataMap = {}
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data()
      userDataMap[data.email] = {
        displayName: data.nickname || data.name || data.email,
        subjects: data.subjects || [],
        rating: data.rating || 0
      }
    })

    // Combine data
    return sortedContributorEmails.map(item => ({
      id: item.email,
      displayName: userDataMap[item.email]?.displayName || item.email,
      subjects: userDataMap[item.email]?.subjects || [],
      rating: userDataMap[item.email]?.rating || 0,
      answers: item.count
    }))
  } catch (error) {
    // Return mock data on error
    return [
      {
        id: 'demo-helper-1',
        displayName: 'Sarah Johnson',
        subjects: ['Mathematics', 'Physics'],
        rating: 4.8,
        answers: 12
      },
      {
        id: 'demo-helper-2',
        displayName: 'Mike Chen',
        subjects: ['Computer Science', 'Chemistry'],
        rating: 4.6,
        answers: 8
      },
      {
        id: 'demo-helper-3',
        displayName: 'Emma Davis',
        subjects: ['Biology', 'Mathematics'],
        rating: 4.9,
        answers: 15
      }
    ]
  }
}

/**
 * Fetches featured subjects based on question count
 * @returns {Promise<Array>} Array of subject objects
 */
export const fetchFeaturedSubjects = async () => {
  try {
    // For now, return a static list of popular subjects
    // In the future, this could be based on actual question counts
    const featuredSubjects = [
      { id: 'mathematics', name: 'Mathematics', questionCount: 45, icon: '📐' },
      { id: 'physics', name: 'Physics', questionCount: 32, icon: '⚡' },
      { id: 'chemistry', name: 'Chemistry', questionCount: 28, icon: '🧪' },
      { id: 'computer-science', name: 'Computer Science', questionCount: 67, icon: '💻' }
    ];
    
    return featuredSubjects;
  } catch (error) {
    throw new FirebaseError('Error fetching featured subjects', error)
  }
}

/**
 * Fetches community statistics
 * @returns {Promise<Object>} Object containing community stats
 */
export const fetchCommunityStats = async () => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS)
    const usersSnapshot = await getDocs(usersRef)
    const totalUsers = usersSnapshot.size

    const activeHelpersQuery = query(usersRef, where('isHelper', '==', true))
    const activeHelpersSnapshot = await getDocs(activeHelpersQuery)
    const activeHelpers = activeHelpersSnapshot.size

    const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    const questionsRef = collection(db, COLLECTIONS.REQUESTS)
    const recentQuestionsQuery = query(
      questionsRef,
      where('createdAt', '>=', sevenDaysAgo)
    )
    const recentQuestionsSnapshot = await getDocs(recentQuestionsQuery)

    return {
      usersHelped: totalUsers,
      questionsThisWeek: recentQuestionsSnapshot.size,
      activeHelpers
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
 * Initializes answersCount field for all requests
 * @returns {Promise<void>}
 */
export const initializeAnswersCountForRequests = async () => {
  try {
    const requestsRef = collection(db, COLLECTIONS.REQUESTS)
    const querySnapshot = await getDocs(requestsRef)
    let updated = 0

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data()
      if (typeof data.answersCount === 'undefined') {
        const requestDocRef = doc(db, COLLECTIONS.REQUESTS, docSnap.id)
        await updateDoc(requestDocRef, { answersCount: 0 })
        updated++
      }
    }
    console.log(`Initialized answersCount for ${updated} requests.`)
  } catch (error) {
    throw new FirebaseError('Error initializing answersCount for requests', error)
  }
} 
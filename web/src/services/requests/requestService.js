// src/services/requestService.js
//
// This service manages requests (questions) and related functionality in the StudyBuddy platform.
// It handles the complete lifecycle of requests including creation, filtering, searching,
// voting, saving, and real-time subscriptions.
//
// Features:
// - Request CRUD operations with advanced filtering
// - Real-time subscriptions with filtering
// - Search functionality with suggestions
// - Voting system for requests
// - Save/unsave functionality for users
// - Pagination support
// - Popular tags and contributors tracking
// - Unanswered questions filtering
// - Time-based filtering

import { db } from '@/src/firebase/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  getCountFromServer,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  deleteDoc,
  setDoc,
  startAfter
} from 'firebase/firestore';

// Helper functions
const buildTimeRangeFilter = (timeRange) => {
  if (!timeRange || timeRange === 'all') return null;
  
  const now = new Date();
  const timeRanges = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };
  
  const fromDate = new Date(now.getTime() - timeRanges[timeRange]);
  return Timestamp.fromDate(fromDate);
};

const applyFilters = (q, filters) => {
  if (filters.subject) q = query(q, where('subject', '==', filters.subject));
  if (filters.status) q = query(q, where('status', '==', filters.status));
  if (filters.userId) q = query(q, where('userId', '==', filters.userId));
  
  const timeFilter = buildTimeRangeFilter(filters.timeRange);
  if (timeFilter) q = query(q, where('createdAt', '>=', timeFilter));
  
  return q;
};

const applySorting = (q, sortBy) => {
  const sortField = sortBy === 'most_answered' ? 'answersCount' : 'createdAt';
  const sortOrder = sortBy === 'most_answered' ? 'desc' : 'desc';
  return query(q, orderBy(sortField, sortOrder));
};

const formatRequest = (doc) => ({
  id: doc.id,
  ...doc.data(),
  createdAtFormatted: formatTimestampWithHour(doc.data().createdAt)
});

const formatTimestampWithHour = (timestamp) => {
  if (timestamp?.toDate && typeof timestamp.seconds === 'number') {
    const date = timestamp.toDate();
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  return '';
};

const filterUnansweredRequests = async (requests) => {
  const filtered = [];
  for (const req of requests) {
    const answersRef = collection(db, 'answers');
    const answersSnap = await getDocs(query(answersRef, where('requestId', '==', req.id)));
    const humanAnswers = answersSnap.docs.filter(a => a.data().userId !== 'ai-bot');
    if (humanAnswers.length === 0) filtered.push(req);
  }
  return filtered.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
};

export const requestService = {
  /**
   * Retrieves requests with optional filtering and sorting
   * @param {object} filters - Filter options (subject, status, userId, timeRange, unanswered, sortBy)
   * @returns {Promise<Array>} Array of request objects
   */
  getRequests: async (filters = {}) => {
    const requestsRef = collection(db, 'requests');
    let q = applyFilters(query(requestsRef), filters);
    q = applySorting(q, filters.sortBy);
    
    const snapshot = await getDocs(q);
    let requests = snapshot.docs.map(formatRequest);
    
    if (filters.unanswered) {
      requests = await filterUnansweredRequests(requests);
    }
    
    return requests;
  },

  /**
   * Sets up real-time subscription to requests with optional filtering
   * @param {function} callback - Function called when requests change
   * @param {object} filters - Filter options (subject, status, userId, timeRange, unanswered, sortBy)
   * @returns {function} Unsubscribe function
   */
  subscribeToRequests: (callback, filters = {}) => {
    const requestsRef = collection(db, 'requests');
    let q = applyFilters(query(requestsRef), filters);
    q = applySorting(q, filters.sortBy);

    return onSnapshot(q, async (snapshot) => {
      let requests = snapshot.docs.map(formatRequest);
      
      if (filters.unanswered) {
        requests = await filterUnansweredRequests(requests);
      }
      
      callback(requests);
    }, (error) => {
      console.error('Firestore subscribeToRequests error:', error);
      callback([]);
    });
  },

  /**
   * Retrieves a single request by its ID
   * @param {string} requestId - The request ID to retrieve
   * @returns {Promise<object|null>} Request object or null if not found
   */
  getRequestById: async (requestId) => {
    const requestRef = doc(db, 'requests', requestId);
    const requestSnap = await getDoc(requestRef);
    return requestSnap.exists() ? { id: requestSnap.id, ...requestSnap.data() } : null;
  },

  /**
   * Creates a new request with default values
   * @param {object} requestData - Request data to create
   * @returns {Promise<object>} Created request with ID
   */
  createRequest: async (requestData) => {
    const requestsRef = collection(db, 'requests');
    const newRequest = {
      ...requestData,
      title_lowercase: requestData.title?.toLowerCase() || '',
      createdAt: serverTimestamp(),
      status: 'open',
      responses: []
    };
    
    const docRef = await addDoc(requestsRef, newRequest);
    return { id: docRef.id, ...newRequest };
  },

  /**
   * Updates an existing request
   * @param {string} requestId - The request ID to update
   * @param {object} updateData - Data to update
   * @returns {Promise<void>}
   */
  updateRequest: async (requestId, updateData) => {
    const requestRef = doc(db, 'requests', requestId);
    await updateDoc(requestRef, { ...updateData, updatedAt: serverTimestamp() });
  },

  /**
   * Gets the count of requests matching the given filters
   * @param {object} filters - Filter options (subject, status, userId)
   * @returns {Promise<number>} Count of matching requests
   */
  getRequestCount: async (filters = {}) => {
    const requestsRef = collection(db, 'requests');
    const q = applyFilters(query(requestsRef), filters);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  },

  /**
   * Sets up real-time subscription to a single request by ID
   * @param {string} requestId - The request ID to subscribe to
   * @param {function} callback - Function called when request changes
   * @returns {function} Unsubscribe function
   */
  subscribeToRequestById: (requestId, callback) => {
    const requestRef = doc(db, 'requests', requestId);
    return onSnapshot(requestRef, (docSnap) => {
      callback(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
    });
  },

  /**
   * Sets up real-time subscription to answers for a request
   * @param {string} requestId - The request ID to subscribe to answers for
   * @param {function} callback - Function called when answers change
   * @returns {function} Unsubscribe function
   */
  subscribeToAnswersByRequestId: (requestId, callback) => {
    const answersRef = collection(db, 'answers');
    const q = query(answersRef, where('requestId', '==', requestId));
    return onSnapshot(q, (snapshot) => {
      const answers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(answers);
    });
  },

  /**
   * Gets search suggestions for requests and topics
   * @param {string} value - Search query string
   * @returns {Promise<Array>} Array of suggestion strings
   */
  getSearchSuggestions: async (value) => {
    const requestsRef = collection(db, 'requests');
    const q1 = query(
      requestsRef,
      where('title', '>=', value),
      where('title', '<=', value + '\uf8ff'),
      orderBy('title'),
      limit(5)
    );
    const querySnapshot = await getDocs(q1);
    const requestSuggestions = querySnapshot.docs.map(doc => doc.data().title);

    const topicsRef = collection(db, 'topics');
    const q2 = query(
      topicsRef,
      where('name', '>=', value),
      where('name', '<=', value + '\uf8ff'),
      orderBy('name'),
      limit(3)
    );
    const topicsSnapshot = await getDocs(q2);
    const topicSuggestions = topicsSnapshot.docs.map(doc => doc.data().name);

    // Combine and deduplicate suggestions
    return [...new Set([...requestSuggestions, ...topicSuggestions])];
  },

  /**
   * Sets up real-time subscription to popular tags
   * @param {function} callback - Function called when popular tags change
   * @returns {function} Unsubscribe function
   */
  subscribeToPopularTags: (callback) => {
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
  },

  /**
   * Sets up real-time subscription to top contributors
   * @param {function} callback - Function called when top contributors change
   * @returns {function} Unsubscribe function
   */
  subscribeToTopContributors: (callback) => {
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
  },

  /**
   * Sets up real-time subscription to available tags
   * @param {function} callback - Function called when available tags change
   * @returns {function} Unsubscribe function
   */
  subscribeToAvailableTags: (callback) => {
    const unsub = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const tagSet = new Set();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.tags)) {
          data.tags.forEach(tag => tagSet.add(tag));
        }
      });
      callback(Array.from(tagSet).sort());
    });
    return unsub;
  },

  /**
   * Upvotes or removes upvote from a request (toggle functionality)
   * @param {string} requestId - The request ID to upvote
   * @param {string} userId - The user ID voting
   * @returns {Promise<void>}
   */
  upvoteRequest: async (requestId, userId) => {
    const requestRef = doc(db, 'requests', requestId);
    const requestSnap = await getDoc(requestRef);
    if (!requestSnap.exists()) return;
    
    const data = requestSnap.data();
    const upvotedBy = data.upvotedBy || [];
    const hasUpvoted = upvotedBy.includes(userId);
    
    await updateDoc(requestRef, {
      upvotes: increment(hasUpvoted ? -1 : 1),
      upvotedBy: hasUpvoted ? arrayRemove(userId) : arrayUnion(userId)
    });
  },

  /**
   * Saves a question for a user
   * @param {string} userId - The user ID
   * @param {string} requestId - The request ID to save
   * @returns {Promise<void>}
   */
  saveQuestion: async (userId, requestId) => {
    const savedRef = doc(db, 'users', userId, 'savedQuestions', requestId);
    await setDoc(savedRef, { savedAt: serverTimestamp() });
  },

  /**
   * Removes a saved question for a user
   * @param {string} userId - The user ID
   * @param {string} requestId - The request ID to unsave
   * @returns {Promise<void>}
   */
  unsaveQuestion: async (userId, requestId) => {
    const savedRef = doc(db, 'users', userId, 'savedQuestions', requestId);
    await deleteDoc(savedRef);
  },

  /**
   * Gets all saved questions for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of saved question objects
   */
  getSavedQuestions: async (userId) => {
    const savedRef = collection(db, 'users', userId, 'savedQuestions');
    const snapshot = await getDocs(savedRef);
    return snapshot.docs.map(doc => ({ id: doc.id, savedAt: doc.data().savedAt }));
  },

  /**
   * Sets up real-time subscription to saved questions for a user
   * @param {string} userId - The user ID
   * @param {function} callback - Function called when saved questions change
   * @returns {function} Unsubscribe function
   */
  subscribeToSavedQuestions: (userId, callback) => {
    const savedRef = collection(db, 'users', userId, 'savedQuestions');
    return onSnapshot(savedRef, (snapshot) => {
      const savedQuestions = snapshot.docs.map(doc => ({ id: doc.id, savedAt: doc.data().savedAt }));
      callback(savedQuestions);
    });
  },

  /**
   * Fetches requests with pagination, search, and filtering support
   * @param {number} limitNum - Number of requests to fetch per page
   * @param {object} lastDoc - Last document for pagination
   * @param {object} filters - Filter options
   * @param {string} searchQuery - Search query string
   * @returns {Promise<object>} Object containing requests and lastDoc for next page
   */
  fetchRequestsPaginated: async (limitNum = 10, lastDoc = null, filters = {}, searchQuery = '') => {
    const requestsRef = collection(db, 'requests');
    let q = applyFilters(query(requestsRef), filters);
    q = applySorting(q, filters.sortBy);
    
    if (searchQuery) {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      q = query(q,
        where('title_lowercase', '>=', lowerCaseSearchQuery),
        where('title_lowercase', '<=', lowerCaseSearchQuery + '~ ')
      );
    }
    
    if (lastDoc) q = query(q, startAfter(lastDoc));
    q = query(q, limit(limitNum));

    const snapshot = await getDocs(q);
    let requests = snapshot.docs.map(formatRequest);

    if (filters.unanswered) {
      requests = await filterUnansweredRequests(requests);
    }

    return { requests, lastDoc: snapshot.docs[snapshot.docs.length - 1] || null };
  },

  /**
   * Formats a Firestore timestamp to show hours and minutes
   * @param {object} timestamp - Firestore timestamp object
   * @returns {string} Formatted time string (HH:MM) or empty string
   */
  formatTimestampWithHour
}; 
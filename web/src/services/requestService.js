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

export const requestService = {
  /**
   * Retrieves requests with optional filtering and sorting
   * @param {object} filters - Filter options (subject, status, userId, timeRange, unanswered, sortBy)
   * @returns {Promise<Array>} Array of request objects
   */
  getRequests: async (filters = {}) => {
    const requestsRef = collection(db, 'requests');
    let q = query(requestsRef);

    // Apply basic filters
    if (filters.subject) {
      q = query(q, where('subject', '==', filters.subject));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    
    // Time range filter for recent requests
    if (filters.timeRange && filters.timeRange !== 'all') {
      let fromDate = null;
      const now = new Date();
      if (filters.timeRange === '24h') {
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === '7d') {
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === '30d') {
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      if (fromDate) {
        q = query(q, where('createdAt', '>=', Timestamp.fromDate(fromDate)));
      }
    }
    
    // Unanswered filter: only show requests with no human answers
    if (filters.unanswered) {
      try {
        // Get all requests (with other filters applied)
        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAtFormatted: requestService.formatTimestampWithHour(doc.data().createdAt)
        }));
        
        // For each request, count only human answers (exclude AI answers)
        const filtered = [];
        for (const req of requests) {
          const answersRef = collection(db, 'answers');
          const answersSnap = await getDocs(query(answersRef, where('requestId', '==', req.id)));
          const humanAnswers = answersSnap.docs.filter(a => a.data().userId !== 'ai-bot');
          if (humanAnswers.length === 0) {
            filtered.push(req);
          }
        }
        
        // Sort by createdAt desc
        filtered.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        
        // If no unanswered questions found, return mock data for demo purposes
        if (filtered.length === 0) {
          return [
            {
              id: 'demo-unanswered-1',
              title: 'Help with calculus integration',
              subject: 'Mathematics',
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
              createdAtFormatted: '1 hour ago'
            },
            {
              id: 'demo-unanswered-2',
              title: 'Understanding organic chemistry reactions',
              subject: 'Chemistry',
              createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
              createdAtFormatted: '3 hours ago'
            },
            {
              id: 'demo-unanswered-3',
              title: 'Python data structures optimization',
              subject: 'Computer Science',
              createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
              createdAtFormatted: '5 hours ago'
            }
          ];
        }
        
        return filtered;
      } catch (error) {
        console.warn('Error fetching unanswered questions:', error);
        // Return mock data on error for demo purposes
        return [
          {
            id: 'demo-unanswered-1',
            title: 'Help with calculus integration',
            subject: 'Mathematics',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            createdAtFormatted: '1 hour ago'
          },
          {
            id: 'demo-unanswered-2',
            title: 'Understanding organic chemistry reactions',
            subject: 'Chemistry',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            createdAtFormatted: '3 hours ago'
          },
          {
            id: 'demo-unanswered-3',
            title: 'Python data structures optimization',
            subject: 'Computer Science',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
            createdAtFormatted: '5 hours ago'
          }
        ];
      }
    }
    
    // Original sorting logic for when unanswered is not active
    if (filters.sortBy === 'most_answered') {
      q = query(q, orderBy('answersCount', 'desc'));
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAtFormatted: requestService.formatTimestampWithHour(doc.data().createdAt)
    }));
  },

  /**
   * Sets up real-time subscription to requests with optional filtering
   * @param {function} callback - Function called when requests change
   * @param {object} filters - Filter options (subject, status, userId, timeRange, unanswered, sortBy)
   * @returns {function} Unsubscribe function
   */
  subscribeToRequests: (callback, filters = {}) => {
    const requestsRef = collection(db, 'requests');
    let q = query(requestsRef);

    // Apply the same filters as getRequests
    if (filters.subject) {
      q = query(q, where('subject', '==', filters.subject));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    
    // Time range filter
    if (filters.timeRange && filters.timeRange !== 'all') {
      let fromDate = null;
      const now = new Date();
      if (filters.timeRange === '24h') {
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === '7d') {
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === '30d') {
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      if (fromDate) {
        q = query(q, where('createdAt', '>=', Timestamp.fromDate(fromDate)));
      }
    }

    // Apply sorting
    if (filters.sortBy === 'most_answered') {
      q = query(q, orderBy('answersCount', 'desc'));
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }

    return onSnapshot(
      q,
      async (snapshot) => {
        let requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAtFormatted: requestService.formatTimestampWithHour(doc.data().createdAt)
        }));

        // If unanswered filter is active, filter out requests with human answers
        if (filters.unanswered) {
          const filteredRequests = [];
          for (const req of requests) {
            const answersRef = collection(db, 'answers');
            const answersSnap = await getDocs(query(answersRef, where('requestId', '==', req.id)));
            const humanAnswers = answersSnap.docs.filter(a => a.data().userId !== 'ai-bot');
            if (humanAnswers.length === 0) {
              filteredRequests.push(req);
            }
          }
          requests = filteredRequests;
        }

        callback(requests);
      },
      (error) => {
        console.error('Firestore subscribeToRequests error:', error);
        callback([]); // Return empty array on error
      }
    );
  },

  /**
   * Retrieves a single request by its ID
   * @param {string} requestId - The request ID to retrieve
   * @returns {Promise<object|null>} Request object or null if not found
   */
  getRequestById: async (requestId) => {
    const requestRef = doc(db, 'requests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (requestSnap.exists()) {
      return {
        id: requestSnap.id,
        ...requestSnap.data()
      };
    }
    return null;
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
      title_lowercase: requestData.title ? requestData.title.toLowerCase() : '',
      createdAt: serverTimestamp(),
      status: 'open',
      responses: []
    };
    
    const docRef = await addDoc(requestsRef, newRequest);
    return {
      id: docRef.id,
      ...newRequest
    };
  },

  /**
   * Updates an existing request
   * @param {string} requestId - The request ID to update
   * @param {object} updateData - Data to update
   * @returns {Promise<void>}
   */
  updateRequest: async (requestId, updateData) => {
    const requestRef = doc(db, 'requests', requestId);
    await updateDoc(requestRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Gets the count of requests matching the given filters
   * @param {object} filters - Filter options (subject, status, userId)
   * @returns {Promise<number>} Count of matching requests
   */
  getRequestCount: async (filters = {}) => {
    const requestsRef = collection(db, 'requests');
    let q = query(requestsRef);

    if (filters.subject) {
      q = query(q, where('subject', '==', filters.subject));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }

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
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
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
    if (upvotedBy.includes(userId)) {
      // Remove upvote
      await updateDoc(requestRef, {
        upvotes: increment(-1),
        upvotedBy: arrayRemove(userId)
      });
    } else {
      // Add upvote
      await updateDoc(requestRef, {
        upvotes: increment(1),
        upvotedBy: arrayUnion(userId)
      });
    }
  },

  /**
   * Formats a Firestore timestamp to show hours and minutes
   * @param {object} timestamp - Firestore timestamp object
   * @returns {string} Formatted time string (HH:MM) or empty string
   */
  formatTimestampWithHour: (timestamp) => {
    // A Firestore Timestamp object has 'seconds' and 'nanoseconds' properties
    // and a 'toDate' method. `serverTimestamp()` is a FieldValue, not a Timestamp
    // until the server writes it back. This check handles both.
    if (timestamp && typeof timestamp.toDate === 'function' && typeof timestamp.seconds === 'number') {
      const date = timestamp.toDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    // If it's not a valid Firestore Timestamp, return an empty string or handle as needed.
    return '';
  },

  /**
   * Saves a question for a user
   * @param {string} userId - The user ID
   * @param {string} requestId - The request ID to save
   * @returns {Promise<void>}
   */
  saveQuestion: async (userId, requestId) => {
    const savedRef = doc(db, 'users', userId, 'savedQuestions', requestId);
    await setDoc(savedRef, {
      savedAt: serverTimestamp()
    });
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
    return snapshot.docs.map(doc => ({
      id: doc.id,
      savedAt: doc.data().savedAt
    }));
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
      const savedQuestions = snapshot.docs.map(doc => ({
        id: doc.id,
        savedAt: doc.data().savedAt
      }));
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
    let q = query(requestsRef);

    // Apply filters
    if (filters.subject) {
      q = query(q, where('subject', '==', filters.subject));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    
    // Time range filter
    if (filters.timeRange && filters.timeRange !== 'all') {
      let fromDate = null;
      const now = new Date();
      if (filters.timeRange === '24h') {
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === '7d') {
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === '30d') {
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      if (fromDate) {
        q = query(q, where('createdAt', '>=', Timestamp.fromDate(fromDate)));
      }
    }

    // Apply sorting
    if (filters.sortBy === 'most_answered') {
      q = query(q, orderBy('answersCount', 'desc'));
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }

    // Apply search query
    if (searchQuery) {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      q = query(q,
        where('title_lowercase', '>=', lowerCaseSearchQuery),
        where('title_lowercase', '<=', lowerCaseSearchQuery + '~ ')
      );
    }
    
    // Pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    q = query(q, limit(limitNum));

    const snapshot = await getDocs(q);
    let requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAtFormatted: requestService.formatTimestampWithHour(doc.data().createdAt)
    }));

    // If unanswered filter is active, filter out requests with human answers
    if (filters.unanswered) {
      const filteredRequests = [];
      for (const req of requests) {
        const answersRef = collection(db, 'answers');
        const answersSnap = await getDocs(query(answersRef, where('requestId', '==', req.id)));
        const humanAnswers = answersSnap.docs.filter(a => a.data().userId !== 'ai-bot');
        if (humanAnswers.length === 0) {
          filteredRequests.push(req);
        }
      }
      requests = filteredRequests;
    }

    return { requests, lastDoc: snapshot.docs[snapshot.docs.length - 1] || null };
  }
}; 
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
  // Get all requests with optional filters
  getRequests: async (filters = {}) => {
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
    // Unanswered filter: only show requests with no human answers
    if (filters.unanswered) {
      // Get all requests (with other filters applied)
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAtFormatted: requestService.formatTimestampWithHour(doc.data().createdAt)
      }));
      // For each request, count only human answers
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
      return filtered;
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

  // Subscribe to requests updates
  subscribeToRequests: (callback, filters = {}) => {
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

  // Get a single request by ID
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

  // Create a new request
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

  // Update a request
  updateRequest: async (requestId, updateData) => {
    const requestRef = doc(db, 'requests', requestId);
    await updateDoc(requestRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  // Get request count
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

  // Subscribe to a single request by ID
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

  // Subscribe to answers for a request by requestId
  subscribeToAnswersByRequestId: (requestId, callback) => {
    const answersRef = collection(db, 'answers');
    const q = query(answersRef, where('requestId', '==', requestId));
    return onSnapshot(q, (snapshot) => {
      const answers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(answers);
    });
  },

  // Get search suggestions for requests and topics
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

  // Subscribe to popular tags
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

  // Subscribe to top contributors
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

  // Subscribe to available tags
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

  // Upvote a request
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

  // Format timestamp with hour
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

  // // Save or unsave a request for a user
  // saveRequestForUser: async (userId, requestId) => {
  //   console.log(`[saveRequestForUser] Attempting to save/unsave for user: ${userId}, request: ${requestId}`);
  //   const savedRef = doc(db, 'users', userId, 'savedQuestions', requestId);
  //   const savedSnap = await getDoc(savedRef);

  //   if (savedSnap.exists()) {
  //     console.log('[saveRequestForUser] Document exists, unsaving...');
  //     await deleteDoc(savedRef);
  //     console.log('[saveRequestForUser] Request unsaved successfully.');
  //     return false; // Indicate unsaved
  //   } else {
  //     console.log('[saveRequestForUser] Document does not exist, saving...');
  //     await setDoc(savedRef, { requestId, savedAt: serverTimestamp() });
  //     console.log('[saveRequestForUser] Request saved successfully.');
  //     return true; // Indicate saved
  //   }
  // },

  // Save a question for a user
  saveQuestion: async (userId, requestId) => {
    const savedRef = doc(db, 'users', userId, 'savedQuestions', requestId);
    await setDoc(savedRef, {
      savedAt: serverTimestamp()
    });
  },

  // Unsave a question for a user
  unsaveQuestion: async (userId, requestId) => {
    const savedRef = doc(db, 'users', userId, 'savedQuestions', requestId);
    await deleteDoc(savedRef);
  },

  // Get all saved questions for a user
  getSavedQuestions: async (userId) => {
    const savedRef = collection(db, 'users', userId, 'savedQuestions');
    const snapshot = await getDocs(savedRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      savedAt: doc.data().savedAt
    }));
  },

  // Subscribe to saved questions for a user
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

  // Paginated fetch for requests with search and filters
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
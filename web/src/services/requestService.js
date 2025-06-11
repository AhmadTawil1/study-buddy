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
  setDoc,
  deleteDoc
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
    if (filters.searchQuery) {
      q = query(q,
        where('title', '>=', filters.searchQuery),
        where('title', '<=', filters.searchQuery + '\uf8ff')
      );
    }

    q = query(q, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
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
    if (filters.searchQuery) {
      q = query(q,
        where('title', '>=', filters.searchQuery),
        where('title', '<=', filters.searchQuery + '\uf8ff')
      );
    }

    q = query(q, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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
        const authorEmail = data.author || data.authorName || 'Unknown';
        if (authorEmail !== 'Unknown') {
          contributorCount[authorEmail] = (contributorCount[authorEmail] || 0) + 1;
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
          userDataMap[data.email] = { name: data.name, nickname: data.nickname };
        });
        const topContributorsWithNames = sortedContributorEmails.map(item => {
          const userData = userDataMap[item.email];
          const displayName = userData?.nickname || userData?.name || item.email;
          return { name: displayName, answers: item.count };
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
    if (upvotedBy.includes(userId)) return; // already upvoted
    await updateDoc(requestRef, {
      upvotes: increment(1),
      upvotedBy: arrayUnion(userId)
    });
  },

  // Save a request for a user
  saveRequestForUser: async (userId, requestId) => {
    const savedQuestionRef = doc(db, 'savedQuestions', `${userId}_${requestId}`);
    await setDoc(savedQuestionRef, {
      userId,
      requestId,
      savedAt: serverTimestamp(),
    });
  },

  // Unsave a request for a user
  unsaveRequestForUser: async (userId, requestId) => {
    const savedQuestionRef = doc(db, 'savedQuestions', `${userId}_${requestId}`);
    await deleteDoc(savedQuestionRef);
  },

  // Check if a request is saved by a user
  isRequestSaved: async (userId, requestId) => {
    if (!userId) return false;
    const savedQuestionRef = doc(db, 'savedQuestions', `${userId}_${requestId}`);
    const docSnap = await getDoc(savedQuestionRef);
    return docSnap.exists();
  }
}; 
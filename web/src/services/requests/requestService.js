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
import { buildQuery } from '@/src/firebase/queries';
import { 
  collection, 
  query, 
  where, 
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
  deleteDoc,
  setDoc,
} from 'firebase/firestore';

// Format helpers
const formatDoc = (doc) => ({ id: doc.id, ...doc.data() });
const formatRequest = (doc) => ({
  ...formatDoc(doc),
  createdAtFormatted: formatTimestampWithHour(doc.data().createdAt)
});

const formatTimestampWithHour = (timestamp) => {
  if (timestamp?.toDate && typeof timestamp.seconds === 'number') {
    const date = timestamp.toDate();
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  return '';
};

// Filter unanswered requests
const filterUnansweredRequests = async (requests) => {
  const filtered = [];
  for (const req of requests) {
    const answersSnap = await getDocs(query(collection(db, 'answers'), where('requestId', '==', req.id)));
    const humanAnswers = answersSnap.docs.filter(a => a.data().userId !== 'ai-bot');
    if (humanAnswers.length === 0) filtered.push(req);
  }
  return filtered.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
};

export const requestService = {
  // Core CRUD
  getRequests: async (filters = {}) => {
    const q = buildQuery('requests', filters, filters.sortBy);
    const snapshot = await getDocs(q);
    let requests = snapshot.docs.map(formatRequest);
    return filters.unanswered ? await filterUnansweredRequests(requests) : requests;
  },

  subscribeToRequests: (callback, filters = {}) => {
    const q = buildQuery('requests', filters, filters.sortBy);
    return onSnapshot(q, async (snapshot) => {
      let requests = snapshot.docs.map(formatRequest);
      if (filters.unanswered) requests = await filterUnansweredRequests(requests);
      callback(requests);
    }, (error) => {
      console.error('Firestore subscribeToRequests error:', error);
      callback([]);
    });
  },

  getRequestById: async (requestId) => {
    const requestSnap = await getDoc(doc(db, 'requests', requestId));
    return requestSnap.exists() ? { id: requestSnap.id, ...requestSnap.data() } : null;
  },

  createRequest: async (requestData) => {
    const newRequest = {
      ...requestData,
      title_lowercase: requestData.title?.toLowerCase() || '',
      createdAt: serverTimestamp(),
      status: 'open',
      responses: []
    };
    const docRef = await addDoc(collection(db, 'requests'), newRequest);
    return { id: docRef.id, ...newRequest };
  },

  updateRequest: async (requestId, updateData) => {
    await updateDoc(doc(db, 'requests', requestId), { ...updateData, updatedAt: serverTimestamp() });
  },

  getRequestCount: async (filters = {}) => {
    const q = buildQuery('requests', filters);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  },

  subscribeToRequestById: (requestId, callback) => {
    return onSnapshot(doc(db, 'requests', requestId), (docSnap) => {
      callback(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
    });
  },

  // Voting
  upvoteRequest: async (requestId, userId) => {
    const requestSnap = await getDoc(doc(db, 'requests', requestId));
    if (!requestSnap.exists()) return;
    
    const data = requestSnap.data();
    const upvotedBy = data.upvotedBy || [];
    const hasUpvoted = upvotedBy.includes(userId);
    
    await updateDoc(doc(db, 'requests', requestId), {
      upvotes: increment(hasUpvoted ? -1 : 1),
      upvotedBy: hasUpvoted ? arrayRemove(userId) : arrayUnion(userId)
    });
  },

  // Save/unsave
  saveQuestion: async (userId, requestId) => {
    await setDoc(doc(db, 'users', userId, 'savedQuestions', requestId), { savedAt: serverTimestamp() });
  },

  unsaveQuestion: async (userId, requestId) => {
    await deleteDoc(doc(db, 'users', userId, 'savedQuestions', requestId));
  },

  getSavedQuestions: async (userId) => {
    const snapshot = await getDocs(collection(db, 'users', userId, 'savedQuestions'));
    return snapshot.docs.map(doc => ({ id: doc.id, savedAt: doc.data().savedAt }));
  },

  subscribeToSavedQuestions: (userId, callback) => {
    return onSnapshot(collection(db, 'users', userId, 'savedQuestions'), (snapshot) => {
      const savedQuestions = snapshot.docs.map(doc => ({ id: doc.id, savedAt: doc.data().savedAt }));
      callback(savedQuestions);
    });
  },

  // Pagination
  fetchRequestsPaginated: async (limitNum = 10, lastDoc = null, filters = {}, searchQuery = '') => {
    const q = buildQuery('requests', filters, filters.sortBy, searchQuery, lastDoc, limitNum);
    const snapshot = await getDocs(q);
    let requests = snapshot.docs.map(formatRequest);
    
    if (filters.unanswered) {
      requests = await filterUnansweredRequests(requests);
    }

    return { requests, lastDoc: snapshot.docs[snapshot.docs.length - 1] || null };
  },

  // Utility
  formatTimestampWithHour
}; 
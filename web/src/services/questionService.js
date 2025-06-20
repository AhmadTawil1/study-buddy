// src/services/questionService.js
//
// This service manages questions, answers, and related functionality in the StudyBuddy platform.
// It handles the complete lifecycle of questions and answers including creation, voting,
// accepting answers, and managing replies.
//
// Features:
// - Question CRUD operations with filtering and search
// - Answer management with AI and human answer support
// - Voting system for questions and answers
// - Reply system for answers
// - Real-time subscriptions
// - Notification integration
// - Answer acceptance workflow

import { db } from '@/src/firebase/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy,  
  getDocs, 
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { notificationService } from '@/src/services/notificationService';

export const questionService = {
  /**
   * Retrieves questions with optional filtering
   * @param {object} filters - Filter options (subject, userId, tags)
   * @returns {Promise<Array>} Array of question objects
   */
  getQuestions: async (filters = {}) => {
    const questionsRef = collection(db, 'questions');
    let q = query(questionsRef);

    if (filters.subject) {
      q = query(q, where('subject', '==', filters.subject));
    }
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    if (filters.tags && filters.tags.length > 0) {
      q = query(q, where('tags', 'array-contains-any', filters.tags));
    }

    q = query(q, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  /**
   * Sets up real-time subscription to questions with optional filtering
   * @param {function} callback - Function called when questions change
   * @param {object} filters - Filter options (subject, userId, tags)
   * @returns {function} Unsubscribe function
   */
  subscribeToQuestions: (callback, filters = {}) => {
    const questionsRef = collection(db, 'questions');
    let q = query(questionsRef);

    if (filters.subject) {
      q = query(q, where('subject', '==', filters.subject));
    }
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    if (filters.tags && filters.tags.length > 0) {
      q = query(q, where('tags', 'array-contains-any', filters.tags));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const questions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(questions);
    });
  },

  /**
   * Retrieves a single question by its ID
   * @param {string} questionId - The question ID to retrieve
   * @returns {Promise<object|null>} Question object or null if not found
   */
  getQuestionById: async (questionId) => {
    const questionRef = doc(db, 'questions', questionId);
    const questionSnap = await getDoc(questionRef);
    
    if (questionSnap.exists()) {
      return {
        id: questionSnap.id,
        ...questionSnap.data()
      };
    }
    return null;
  },

  /**
   * Creates a new question with default values
   * @param {object} questionData - Question data to create
   * @returns {Promise<object>} Created question with ID
   */
  createQuestion: async (questionData) => {
    const questionsRef = collection(db, 'questions');
    const newQuestion = {
      ...questionData,
      title_lowercase: questionData.title ? questionData.title.toLowerCase() : '',
      createdAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      answers: [],
      views: 0
    };
    
    const docRef = await addDoc(questionsRef, newQuestion);
    return {
      id: docRef.id,
      ...newQuestion
    };
  },

  /**
   * Updates an existing question
   * @param {string} questionId - The question ID to update
   * @param {object} updateData - Data to update
   * @returns {Promise<void>}
   */
  updateQuestion: async (questionId, updateData) => {
    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Adds an answer to a question/request with special handling for AI answers
   * @param {string} requestId - The request/question ID to answer
   * @param {object} answerData - Answer data including userId, content, etc.
   * @returns {Promise<object>} Created answer with ID
   */
  addAnswer: async (requestId, answerData) => {
    // Support both questions and requests collections
    const requestRef = doc(db, 'requests', requestId);
    const requestSnap = await getDoc(requestRef);
    if (!requestSnap.exists()) {
      throw new Error('Question not found');
    }
    const requestData = requestSnap.data();

    const answersRef = collection(db, 'answers');
    let answerDocRef;
    let newAnswerData = {}; // Initialize with default values

    if (answerData.userId === 'ai-bot') {
      // For AI answers, use a deterministic ID to ensure uniqueness per request
      const aiAnswerId = `${requestId}_ai_answer`;
      answerDocRef = doc(db, 'answers', aiAnswerId);
      const aiAnswerSnap = await getDoc(answerDocRef);

      if (aiAnswerSnap.exists()) {
        console.log('AI answer already exists for this request. Updating existing.');
        await updateDoc(answerDocRef, {
          ...answerData,
          requestId,
          questionTitle: requestData.title,
          updatedAt: serverTimestamp(),
        });
        return { id: aiAnswerId, ...answerData, ...aiAnswerSnap.data() };
      } else {
        console.log('Adding new AI answer.');
        newAnswerData = {
          ...answerData,
          requestId,
          questionTitle: requestData.title,
          createdAt: serverTimestamp(),
          upvotes: 0,
          downvotes: 0,
          isAccepted: false,
          upvotedBy: [],
          replies: [] // Initialize empty replies array
        };
        await setDoc(answerDocRef, newAnswerData);
        // Only update requestRef if it's a truly new AI answer
        await updateDoc(requestRef, {
          answers: arrayUnion(answerDocRef.id),
          updatedAt: serverTimestamp()
          // Do NOT increment answersCount for AI answers
        });
      }
    } else {
      // For human answers, continue with addDoc
      newAnswerData = {
        ...answerData,
        requestId,
        questionTitle: requestData.title,
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        isAccepted: false,
        upvotedBy: [],
        replies: [] // Initialize empty replies array
      };
      const humanAnswerDoc = await addDoc(answersRef, newAnswerData);
      answerDocRef = humanAnswerDoc;
      // Update requestRef for human answers
      await updateDoc(requestRef, {
        answers: arrayUnion(answerDocRef.id),
        updatedAt: serverTimestamp(),
        answersCount: increment(1) // Increment answer count
      });
    }

    // Notification logic remains outside the conditional adding/updating for simplicity
    if (requestData.userId && answerData.userId && answerData.userId !== requestData.userId && answerData.userId !== 'ai-bot') {
      await notificationService.createNotification({
        userId: requestData.userId,
        type: 'answer',
        questionId: requestId,
        answerId: answerDocRef.id,
        message: `Your question "${requestData.title}" received a new answer!`
      });
    }

    return {
      id: answerDocRef.id,
      ...newAnswerData
    };
  },

  /**
   * Updates an existing answer
   * @param {string} answerId - The answer ID to update
   * @param {object} updateData - Data to update
   * @returns {Promise<void>}
   */
  updateAnswer: async (answerId, updateData) => {
    const answerRef = doc(db, 'answers', answerId);
    await updateDoc(answerRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Votes on a question (upvote or downvote)
   * @param {string} questionId - The question ID to vote on
   * @param {string} voteType - 'up' or 'down'
   * @param {string} userId - The user ID voting
   * @returns {Promise<void>}
   */
  voteQuestion: async (questionId, voteType, userId) => {
    const questionRef = doc(db, 'questions', questionId);
    const updates = {};
    
    if (voteType === 'up') {
      updates.upvotes = increment(1);
    } else if (voteType === 'down') {
      updates.downvotes = increment(1);
    }

    await updateDoc(questionRef, updates);
    
    // Notify question owner if someone else upvotes
    if (voteType === 'up' && userId) {
      const questionSnap = await getDoc(questionRef);
      const questionData = questionSnap.data();
      if (questionData.userId && userId !== questionData.userId) {
        await notificationService.createNotification({
          userId: questionData.userId,
          type: 'upvote',
          questionId,
          message: `Your question "${questionData.title}" received an upvote!`
        });
      }
    }
  },

  /**
   * Votes on an answer with toggle functionality for upvotes
   * @param {string} answerId - The answer ID to vote on
   * @param {string} voteType - 'up' or 'down'
   * @param {string} userId - The user ID voting
   * @returns {Promise<void>}
   */
  voteAnswer: async (answerId, voteType, userId) => {
    const answerRef = doc(db, 'answers', answerId);
    const answerSnap = await getDoc(answerRef);
    if (!answerSnap.exists()) return;
    const data = answerSnap.data();
    const upvotedBy = data.upvotedBy || [];
    
    if (voteType === 'up') {
      if (upvotedBy.includes(userId)) {
        // Remove upvote (toggle off)
        await updateDoc(answerRef, {
          upvotes: increment(-1),
          upvotedBy: arrayRemove(userId)
        });
      } else {
        // Add upvote (toggle on)
        await updateDoc(answerRef, {
          upvotes: increment(1),
          upvotedBy: arrayUnion(userId)
        });
      }
    } else if (voteType === 'down') {
      await updateDoc(answerRef, {
        downvotes: increment(1)
      });
    }
  },

  /**
   * Accepts an answer as the best answer for a question
   * @param {string} questionId - The question ID
   * @param {string} answerId - The answer ID to accept
   * @returns {Promise<void>}
   */
  acceptAnswer: async (questionId, answerId) => {
    const questionRef = doc(db, 'questions', questionId);
    const answerRef = doc(db, 'answers', answerId);

    await updateDoc(questionRef, {
      acceptedAnswerId: answerId,
      updatedAt: serverTimestamp()
    });

    await updateDoc(answerRef, {
      isAccepted: true,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Deletes an answer and updates the parent request
   * Also deletes all associated replies
   * @param {string} answerId - The answer ID to delete
   * @returns {Promise<void>}
   */
  deleteAnswer: async (answerId) => {
    const answerRef = doc(db, 'answers', answerId);
    const answerSnap = await getDoc(answerRef);
    if (!answerSnap.exists()) return;
    
    const answerData = answerSnap.data();
    const requestId = answerData.requestId;
    const replyIds = answerData.replies || [];

    // Delete all replies first
    const deleteRepliesPromises = replyIds.map(replyId => {
      const replyRef = doc(db, 'replies', replyId);
      return deleteDoc(replyRef);
    });

    // Wait for all replies to be deleted
    await Promise.all(deleteRepliesPromises);

    // Update the request to remove the answer ID and decrement count
    if (requestId) {
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, {
        answers: arrayRemove(answerId),
        updatedAt: serverTimestamp(),
        answersCount: increment(-1) // Decrement answer count
      });
    }

    // Finally delete the answer
    await deleteDoc(answerRef);
  },

  /**
   * Adds a reply to an answer
   * @param {string} answerId - The answer ID to reply to
   * @param {object} replyData - Reply data including content, author, etc.
   * @returns {Promise<object>} Created reply with ID
   */
  addReply: async (answerId, replyData) => {
    if (!answerId || typeof answerId !== 'string') {
      console.error('Invalid answerId provided to addReply:', answerId);
      throw new Error('Invalid answerId provided to addReply');
    }
    console.log('Adding reply to answerId:', answerId, 'with data:', replyData);
    const answerRef = doc(db, 'answers', answerId);
    const answerSnap = await getDoc(answerRef);
    if (!answerSnap.exists()) {
      throw new Error('Answer not found');
    }
    
    // Ensure repliesRef is a top-level collection
    const repliesRef = collection(db, 'replies');
    const newReply = {
      ...replyData,
      answerId,
      createdAt: serverTimestamp(),
      upvotes: 0,
      upvotedBy: []
    };
    const replyDoc = await addDoc(repliesRef, newReply);
    await updateDoc(answerRef, {
      replies: arrayUnion(replyDoc.id),
      updatedAt: serverTimestamp()
    });
    return {
      id: replyDoc.id,
      ...newReply
    };
  },

  /**
   * Retrieves all replies for a specific answer
   * @param {string} answerId - The answer ID to get replies for
   * @returns {Promise<Array>} Array of reply objects
   */
  getReplies: async (answerId) => {
    const repliesRef = collection(db, 'replies');
    const q = query(repliesRef, where('answerId', '==', answerId), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  /**
   * Sets up real-time subscription to replies for an answer
   * @param {string} answerId - The answer ID to subscribe to replies for
   * @param {function} callback - Function called when replies change
   * @returns {function} Unsubscribe function
   */
  subscribeToReplies: (answerId, callback) => {
    const repliesRef = collection(db, 'replies');
    const q = query(repliesRef, where('answerId', '==', answerId), orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const replies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAtFormatted: questionService.formatTimestampWithHour(doc.data().createdAt),
        createdAtFullDate: doc.data().createdAt?.toDate().toLocaleDateString()
      }));
      callback(replies);
    });
  },

  /**
   * Votes on a reply
   * @param {string} replyId - The reply ID to vote on
   * @param {string} voteType - 'up' or 'down'
   * @param {string} userId - The user ID voting
   * @returns {Promise<void>}
   */
  voteReply: async (replyId, voteType, userId) => {
    const replyRef = doc(db, 'replies', replyId);
    const replySnap = await getDoc(replyRef);
    if (!replySnap.exists()) return;
    
    const data = replySnap.data();
    const upvotedBy = data.upvotedBy || [];
    
    if (voteType === 'up') {
      if (upvotedBy.includes(userId)) return; // already upvoted
      await updateDoc(replyRef, {
        upvotes: increment(1),
        upvotedBy: arrayUnion(userId)
      });
    } else if (voteType === 'down') {
      await updateDoc(replyRef, {
        downvotes: increment(1)
      });
    }
  },

  /**
   * Deletes a reply and updates the parent answer
   * @param {string} replyId - The reply ID to delete
   * @returns {Promise<void>}
   */
  deleteReply: async (replyId) => {
    const replyRef = doc(db, 'replies', replyId);
    const replySnap = await getDoc(replyRef);
    if (!replySnap.exists()) return;
    
    const replyData = replySnap.data();
    const answerId = replyData.answerId;
    
    if (answerId) {
      const answerRef = doc(db, 'answers', answerId);
      await updateDoc(answerRef, {
        replies: arrayRemove(replyId),
        updatedAt: serverTimestamp()
      });
    }
    
    await deleteDoc(replyRef);
  },

  /**
   * Formats a Firestore timestamp to show hours and minutes
   * @param {object} timestamp - Firestore timestamp object
   * @returns {string} Formatted time string (HH:MM)
   */
  formatTimestampWithHour: (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
      return '';
    }
    const date = timestamp.toDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return formattedTime;
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
      const answers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAtFormatted: questionService.formatTimestampWithHour(doc.data().createdAt),
        createdAtFullDate: doc.data().createdAt?.toDate().toLocaleDateString()
      }));
      callback(answers);
    });
  }
}; 
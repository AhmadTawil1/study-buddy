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
  increment,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from 'firebase/firestore';
import { notificationService } from '@/src/services/notificationService';

export const questionService = {
  // Get all questions with optional filters
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

  // Subscribe to questions updates
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

  // Get a single question by ID
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

  // Create a new question
  createQuestion: async (questionData) => {
    const questionsRef = collection(db, 'questions');
    const newQuestion = {
      ...questionData,
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

  // Update a question
  updateQuestion: async (questionId, updateData) => {
    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  // Add an answer to a question/request
  addAnswer: async (requestId, answerData) => {
    // Support both questions and requests collections
    const requestRef = doc(db, 'requests', requestId);
    const requestSnap = await getDoc(requestRef);
    if (!requestSnap.exists()) {
      throw new Error('Question not found');
    }
    const requestData = requestSnap.data();
    
    const answersRef = collection(db, 'answers');
    const newAnswer = {
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
    const answerDoc = await addDoc(answersRef, newAnswer);
    await updateDoc(requestRef, {
      answers: arrayUnion(answerDoc.id),
      updatedAt: serverTimestamp(),
      answersCount: increment(1) // Increment answer count
    });
    // Notify question owner if someone else answers
    if (requestData.userId && answerData.userId !== requestData.userId) {
      await notificationService.createNotification({
        userId: requestData.userId,
        type: 'answer',
        questionId: requestId,
        answerId: answerDoc.id,
        message: `Your question "${requestData.title}" received a new answer!`
      });
    }
    return {
      id: answerDoc.id,
      ...newAnswer
    };
  },

  // Update answer
  updateAnswer: async (answerId, updateData) => {
    const answerRef = doc(db, 'answers', answerId);
    await updateDoc(answerRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  // Vote on a question
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

  // Vote on an answer
  voteAnswer: async (answerId, voteType, userId) => {
    const answerRef = doc(db, 'answers', answerId);
    const answerSnap = await getDoc(answerRef);
    if (!answerSnap.exists()) return;
    const data = answerSnap.data();
    const upvotedBy = data.upvotedBy || [];
    if (voteType === 'up') {
      if (upvotedBy.includes(userId)) return; // already upvoted
      await updateDoc(answerRef, {
        upvotes: increment(1),
        upvotedBy: arrayUnion(userId)
      });
    } else if (voteType === 'down') {
      await updateDoc(answerRef, {
        downvotes: increment(1)
      });
    }
  },

  // Accept an answer
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

  // Delete an answer and update the parent request
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

  // Add a reply to an answer
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

  // Get replies for an answer
  getReplies: async (answerId) => {
    const repliesRef = collection(db, 'replies');
    const q = query(repliesRef, where('answerId', '==', answerId), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Subscribe to replies for an answer
  subscribeToReplies: (answerId, callback) => {
    const repliesRef = collection(db, 'replies');
    const q = query(repliesRef, where('answerId', '==', answerId), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const replies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(replies);
    });
  },

  // Vote on a reply
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

  // Delete a reply
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
  }
}; 
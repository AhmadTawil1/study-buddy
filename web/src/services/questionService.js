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
import { collection, query, where, orderBy, getDocs, onSnapshot, doc, getDoc, addDoc, updateDoc, serverTimestamp, increment, arrayUnion, arrayRemove, deleteDoc, setDoc } from 'firebase/firestore';
import { notificationService } from '@/src/services/notificationService';

const qCol = (col, f = {}, ord = 'createdAt') => {
  let q = query(collection(db, col));
  if (f.subject) q = query(q, where('subject', '==', f.subject));
  if (f.userId) q = query(q, where('userId', '==', f.userId));
  if (f.tags?.length) q = query(q, where('tags', 'array-contains-any', f.tags));
  return query(q, orderBy(ord, 'desc'));
};
const notify = async (userId, type, data) => userId && notificationService.createNotification({ userId, type, ...data });

export const questionService = {
  /**
   * Retrieves questions with optional filtering
   * @param {object} filters - Filter options (subject, userId, tags)
   * @returns {Promise<Array>} Array of question objects
   */
  getQuestions: async (filters = {}) => {
    const snapshot = await getDocs(qCol('questions', filters));
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
  subscribeToQuestions: (cb, f = {}) => onSnapshot(qCol('questions', f), snap => cb(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))),

  /**
   * Creates a new question with default values
   * @param {object} questionData - Question data to create
   * @returns {Promise<object>} Created question with ID
   */
  createQuestion: async d => {
    const q = { ...d, title_lowercase: d.title?.toLowerCase() || '', createdAt: serverTimestamp(), upvotes: 0, downvotes: 0, answers: [], views: 0 };
    const ref = await addDoc(collection(db, 'questions'), q);
    return { id: ref.id, ...q };
  },

  /**
   * Updates an existing question
   * @param {string} requestId - The request ID to update
   * @param {object} updateData - Data to update
   * @returns {Promise<void>}
   */
  updateQuestion: (id, d) => updateDoc(doc(db, 'questions', id), { ...d, updatedAt: serverTimestamp() }),

  /**
   * Adds an answer to a question/request with special handling for AI answers
   * @param {string} requestId - The request/question ID to answer
   * @param {object} answerData - Answer data including userId, content, etc.
   * @returns {Promise<object>} Created answer with ID
   */
  addAnswer: async (rid, d) => {
    const reqRef = doc(db, 'requests', rid), reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) throw new Error('Question not found');
    const req = reqSnap.data();
    let answerRef, newA;
    if (d.userId === 'ai-bot') {
      answerRef = doc(db, 'answers', `${rid}_ai_answer`);
      const aiSnap = await getDoc(answerRef);
      if (aiSnap.exists()) {
        await updateDoc(answerRef, { ...d, requestId: rid, questionTitle: req.title, updatedAt: serverTimestamp() });
        return { id: answerRef.id, ...d, ...aiSnap.data() };
      }
      newA = { ...d, requestId: rid, questionTitle: req.title, createdAt: serverTimestamp(), upvotes: 0, downvotes: 0, upvotedBy: [], replies: [] };
      await setDoc(answerRef, newA);
      await updateDoc(reqRef, { answers: arrayUnion(answerRef.id), updatedAt: serverTimestamp() });
    } else {
      newA = { ...d, requestId: rid, questionTitle: req.title, createdAt: serverTimestamp(), upvotes: 0, downvotes: 0, upvotedBy: [], replies: [] };
      answerRef = await addDoc(collection(db, 'answers'), newA);
      await updateDoc(reqRef, { answers: arrayUnion(answerRef.id), updatedAt: serverTimestamp(), answersCount: increment(1) });
    }
    if (req.userId && d.userId && d.userId !== req.userId && d.userId !== 'ai-bot')
      await notify(req.userId, 'answer', { questionId: rid, answerId: answerRef.id, message: `Your question "${req.title}" received a new answer!` });
    return { id: answerRef.id, ...newA };
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
   * @param {string} requestId - The request ID to vote on
   * @param {string} voteType - 'up' or 'down'
   * @param {string} userId - The user ID voting
   * @returns {Promise<void>}
   */
  voteQuestion: async (id, t, uid) => {
    const ref = doc(db, 'questions', id);
    await updateDoc(ref, { [t === 'up' ? 'upvotes' : 'downvotes']: increment(1) });
    if (t === 'up' && uid) {
      const d = (await getDoc(ref)).data();
      if (d.userId && uid !== d.userId) await notify(d.userId, 'upvote', { requestId: id, message: `Your question "${d.title}" received an upvote!` });
    }
  },

  /**
   * Votes on an answer with toggle functionality for upvotes
   * @param {string} answerId - The answer ID to vote on
   * @param {string} voteType - 'up' or 'down'
   * @param {string} userId - The user ID voting
   * @returns {Promise<void>}
   */
  voteAnswer: async (id, t, uid) => {
    const ref = doc(db, 'answers', id), snap = await getDoc(ref);
    if (!snap.exists()) return;
    const d = snap.data(), upvotedBy = d.upvotedBy || [];
    if (t === 'up') upvotedBy.includes(uid)
      ? await updateDoc(ref, { upvotes: increment(-1), upvotedBy: arrayRemove(uid) })
      : await updateDoc(ref, { upvotes: increment(1), upvotedBy: arrayUnion(uid) });
    else if (t === 'down') await updateDoc(ref, { downvotes: increment(1) });
  },



  /**
   * Deletes an answer and updates the parent request
   * Also deletes all associated replies
   * @param {string} answerId - The answer ID to delete
   * @returns {Promise<void>}
   */
  deleteAnswer: async id => {
    const ref = doc(db, 'answers', id), snap = await getDoc(ref);
    if (!snap.exists()) return;
    const d = snap.data(), reqId = d.requestId, replyIds = d.replies || [];
    await Promise.all(replyIds.map(rid => deleteDoc(doc(db, 'replies', rid))));
    if (reqId) await updateDoc(doc(db, 'requests', reqId), { answers: arrayRemove(id), updatedAt: serverTimestamp(), answersCount: increment(-1) });
    await deleteDoc(ref);
  },

  /**
   * Adds a reply to an answer
   * @param {string} answerId - The answer ID to reply to
   * @param {object} replyData - Reply data including content, author, etc.
   * @returns {Promise<object>} Created reply with ID
   */
  addReply: async (aid, d) => {
    if (!aid || typeof aid !== 'string') throw new Error('Invalid answerId');
    const answerRef = doc(db, 'answers', aid), answerSnap = await getDoc(answerRef);
    if (!answerSnap.exists()) throw new Error('Answer not found');
    const newReply = { ...d, answerId: aid, createdAt: serverTimestamp(), upvotes: 0, upvotedBy: [] };
    const replyDoc = await addDoc(collection(db, 'replies'), newReply);
    await updateDoc(answerRef, { replies: arrayUnion(replyDoc.id), updatedAt: serverTimestamp() });
    return { id: replyDoc.id, ...newReply };
  },

  /**
   * Retrieves all replies for a specific answer
   * @param {string} answerId - The answer ID to get replies for
   * @returns {Promise<Array>} Array of reply objects
   */
  getReplies: async (answerId) => {
    const snapshot = await getDocs(query(collection(db, 'replies'), where('answerId', '==', answerId), orderBy('createdAt', 'asc')));
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
  subscribeToReplies: (aid, cb) => onSnapshot(
    query(collection(db, 'replies'), where('answerId', '==', aid), orderBy('createdAt', 'asc')),
    snap => cb(snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAtFormatted: questionService.formatTimestampWithHour(doc.data().createdAt),
      createdAtFullDate: doc.data().createdAt?.toDate().toLocaleDateString()
    })))
  ),

  /**
   * Votes on a reply
   * @param {string} replyId - The reply ID to vote on
   * @param {string} voteType - 'up' or 'down'
   * @param {string} userId - The user ID voting
   * @returns {Promise<void>}
   */
  voteReply: async (id, t, uid) => {
    const ref = doc(db, 'replies', id), snap = await getDoc(ref);
    if (!snap.exists()) return;
    const d = snap.data(), upvotedBy = d.upvotedBy || [];
    if (t === 'up') {
      if (upvotedBy.includes(uid)) return;
      await updateDoc(ref, { upvotes: increment(1), upvotedBy: arrayUnion(uid) });
    } else if (t === 'down') await updateDoc(ref, { downvotes: increment(1) });
  },

  /**
   * Deletes a reply and updates the parent answer
   * @param {string} replyId - The reply ID to delete
   * @returns {Promise<void>}
   */
  deleteReply: async id => {
    const ref = doc(db, 'replies', id), snap = await getDoc(ref);
    if (!snap.exists()) return;
    const d = snap.data(), answerId = d.answerId;
    if (answerId) await updateDoc(doc(db, 'answers', answerId), { replies: arrayRemove(id), updatedAt: serverTimestamp() });
    await deleteDoc(ref);
  },

  /**
   * Formats a Firestore timestamp to show hours and minutes
   * @param {object} timestamp - Firestore timestamp object
   * @returns {string} Formatted time string (HH:MM)
   */
  formatTimestampWithHour: t => (!t || typeof t.toDate !== 'function') ? '' : `${t.toDate().getHours().toString().padStart(2, '0')}:${t.toDate().getMinutes().toString().padStart(2, '0')}`
}; 
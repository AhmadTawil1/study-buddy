// src/services/profileService.js
//
// This service manages user profile data and related functionality in the StudyBuddy platform.
// It handles user profiles, questions, answers, saved content, and user statistics.
//
// Features:
// - User profile retrieval and updates
// - Question and answer history
// - Saved questions management
// - User statistics and rankings
// - Public profile data for other users

import { db } from '@/src/firebase/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

export const profileService = {
  /**
   * Retrieves the full user profile data for the authenticated user
   * @param {string} userId - The user ID to fetch profile for
   * @returns {Promise<object|null>} User profile data or null if not found
   */
  getUserProfile: async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  },
  
  /**
   * Retrieves public profile information for viewing other users' profiles
   * Returns only safe, public information that can be shared
   * @param {string} userId - The user ID to fetch public profile for
   * @returns {Promise<object|null>} Public user profile data or null if not found
   */
  getPublicUserProfile: async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        id: userSnap.id,
        name: userData.name || 'Anonymous',
        email: userData.email,
        avatar: userData.avatar || null,
        joinDate: userData.joinDate || null,
        // Add any other public fields you want to display
      };
    }
    return null;
  },

  /**
   * Retrieves all questions asked by a specific user
   * @param {string} userId - The user ID to fetch questions for
   * @returns {Promise<Array>} Array of question objects
   */
  getUserQuestions: async (userId) => {
    const questionsQuery = query(collection(db, 'requests'), where('userId', '==', userId));
    const questionsSnap = await getDocs(questionsQuery);
    return questionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Retrieves all answers provided by a specific user
   * Handles multiple possible author field names for compatibility
   * @param {string} userId - The user ID to fetch answers for
   * @param {string} userEmail - The user's email for additional querying
   * @returns {Promise<Array>} Array of answer objects with question titles
   */
  getUserAnswers: async (userId, userEmail) => {
    // Fetch answers by userId or author/authorEmail fields for compatibility
    const answersRef = collection(db, 'answers');
    const q1 = query(answersRef, where('userId', '==', userId));
    const q2 = query(answersRef, where('author', '==', userEmail));
    const q3 = query(answersRef, where('authorEmail', '==', userEmail));
    
    // Execute all queries in parallel for better performance
    const [snap1, snap2, snap3] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
      getDocs(q3)
    ]);
    
    // Merge and deduplicate answers by id to avoid duplicates
    const allAnswers = [...snap1.docs, ...snap2.docs, ...snap3.docs];
    const uniqueAnswers = Object.values(
      allAnswers.reduce((acc, doc) => {
        acc[doc.id] = { id: doc.id, ...doc.data() };
        return acc;
      }, {})
    );

    // Fetch question titles for answers that don't have them
    // This ensures all answers have proper question context
    const answersWithTitles = await Promise.all(
      uniqueAnswers.map(async (answer) => {
        if (answer.questionTitle) return answer; // Skip if already has title
        
        try {
          const requestRef = doc(db, 'requests', answer.requestId);
          const requestSnap = await getDoc(requestRef);
          if (requestSnap.exists()) {
            const requestData = requestSnap.data();
            // Update the answer with the question title for future queries
            const answerRef = doc(db, 'answers', answer.id);
            await updateDoc(answerRef, { questionTitle: requestData.title });
            return { ...answer, questionTitle: requestData.title };
          }
        } catch (error) {
          console.error('Error fetching question title:', error);
        }
        return answer;
      })
    );

    return answersWithTitles;
  },

  /**
   * Retrieves all saved questions for a specific user
   * @param {string} userId - The user ID to fetch saved questions for
   * @returns {Promise<Array>} Array of saved question objects
   */
  getUserSavedQuestions: async (userId) => {
    console.log(`[profileService.getUserSavedQuestions] Fetching saved questions for user: ${userId}`);
    const savedQuery = query(collection(db, 'users', userId, 'savedQuestions'));
    const savedSnap = await getDocs(savedQuery);
    const savedDocs = savedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('[profileService.getUserSavedQuestions] Raw saved documents fetched:', savedDocs);
    return savedDocs;
  },

  /**
   * Calculates comprehensive user statistics including questions, answers, upvotes, and ranking
   * @param {string} userId - The user ID to calculate stats for
   * @param {string} userEmail - The user's email for additional querying
   * @returns {Promise<object>} Object containing user statistics
   */
  getUserStats: async (userId, userEmail) => {
    // Fetch answers for upvotes and ratings (by userId or author/authorEmail)
    const answersRef = collection(db, 'answers');
    const q1 = query(answersRef, where('userId', '==', userId));
    const q2 = query(answersRef, where('author', '==', userEmail));
    const q3 = query(answersRef, where('authorEmail', '==', userEmail));
    
    // Execute all queries in parallel
    const [snap1, snap2, snap3] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
      getDocs(q3)
    ]);
    
    // Merge and deduplicate answers by id
    const allAnswers = [...snap1.docs, ...snap2.docs, ...snap3.docs];
    const uniqueAnswers = Object.values(
      allAnswers.reduce((acc, doc) => {
        acc[doc.id] = doc;
        return acc;
      }, {})
    );
    
    // Calculate upvotes and ratings from all answers
    let upvotes = 0;
    let totalRating = 0;
    let ratingCount = 0;
    uniqueAnswers.forEach(doc => {
      const data = doc.data ? doc.data() : doc;
      upvotes += data.upvotes || 0;
      if (Array.isArray(data.ratings)) {
        data.ratings.forEach(r => {
          totalRating += r;
          ratingCount++;
        });
      }
    });
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
    
    // Calculate user ranking based on upvotes compared to all users
    const usersSnap = await getDocs(collection(db, 'users'));
    const allUserUpvotes = [];
    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const userAnswersQuery = query(collection(db, 'answers'), where('userId', '==', userId));
      const userAnswersSnap = await getDocs(userAnswersQuery);
      let userUpvotes = 0;
      userAnswersSnap.docs.forEach(ansDoc => {
        userUpvotes += ansDoc.data().upvotes || 0;
      });
      allUserUpvotes.push({ userId, upvotes: userUpvotes });
    }
    
    // Sort users by upvotes and find current user's rank
    allUserUpvotes.sort((a, b) => b.upvotes - a.upvotes);
    const rank = allUserUpvotes.findIndex(u => u.userId === userId) + 1;
    
    return {
      questionsAsked: 0, // to be set in component
      questionsAnswered: uniqueAnswers.length,
      upvotesEarned: upvotes,
      averageRating,
      rank
    };
  },

  /**
   * Updates specific fields in a user's profile
   * @param {string} userId - The user ID to update
   * @param {object} updates - Object containing fields to update
   * @returns {Promise<void>}
   */
  updateProfile: async (userId, updates) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  }
}; 
/**
 * questionContext.js
 * 
 * This module provides question state management for the StudyBuddy application.
 * It implements a context system that handles:
 * - Real-time question data synchronization with Firestore
 * - Question creation, updates, and voting
 * - Answer management and acceptance
 * - Question filtering and search
 * - Loading states and error handling
 * 
 * The context is used globally to provide consistent access to question data
 * and management functions across all components.
 */

'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { questionService } from '@/src/services/questionService';
import { useUser } from '@/src/context/userContext';

/**
 * QuestionContext
 * 
 * Context object that will hold the question state and related functions.
 * Initialized as undefined and will be populated by the QuestionProvider.
 */
const QuestionContext = createContext();

/**
 * QuestionProvider Component
 * 
 * Manages question data and provides question-related operations.
 * Handles real-time updates and question management operations.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped with question context
 */
export const QuestionProvider = ({ children }) => {
  const { user } = useUser();
  
  // State for list of questions
  const [questions, setQuestions] = useState([]);
  // Loading state for initial data fetch
  const [loading, setLoading] = useState(true);
  
  // Default filter configuration
  const [filters, setFilters] = useState({
    subject: null,    // Filter by subject
    tags: [],         // Filter by tags
    userId: null      // Filter by user ID
  });

  /**
   * Effect hook to handle real-time question updates
   * - Subscribes to Firestore for question changes
   * - Updates local state when changes occur
   * - Cleans up subscription on unmount
   * - Re-subscribes when user or filters change
   */
  useEffect(() => {
    if (!user) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    const unsubscribe = questionService.subscribeToQuestions(
      (updatedQuestions) => {
        setQuestions(updatedQuestions);
        setLoading(false);
      },
      filters
    );

    return () => unsubscribe();
  }, [user, filters]);

  /**
   * Creates a new question in Firestore
   * 
   * @param {Object} questionData - Data for the new question
   * @returns {Promise<Object>} The created question object
   * @throws {Error} If question creation fails
   * 
   * Example usage:
   * ```js
   * const { createQuestion } = useQuestion();
   * const newQuestion = await createQuestion({
   *   title: 'How to solve this calculus problem?',
   *   content: 'I need help with...'
   * });
   * ```
   */
  const createQuestion = async (questionData) => {
    try {
      const newQuestion = await questionService.createQuestion({
        ...questionData,
        userId: user.uid,
        authorName: user.displayName || 'Anonymous'
      });
      return newQuestion;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  };

  /**
   * Updates an existing question in Firestore
   * 
   * @param {string} questionId - ID of the question to update
   * @param {Object} updateData - Fields to update
   * @returns {Promise<void>}
   * @throws {Error} If question update fails
   * 
   * Example usage:
   * ```js
   * const { updateQuestion } = useQuestion();
   * await updateQuestion('question123', { title: 'Updated title' });
   * ```
   */
  const updateQuestion = async (questionId, updateData) => {
    try {
      await questionService.updateQuestion(questionId, updateData);
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  };

  /**
   * Adds an answer to a question
   * 
   * @param {string} questionId - ID of the question
   * @param {Object} answerData - Data for the answer
   * @returns {Promise<Object>} The created answer object
   * @throws {Error} If answer creation fails
   * 
   * Example usage:
   * ```js
   * const { addAnswer } = useQuestion();
   * const newAnswer = await addAnswer('question123', {
   *   content: 'Here is the solution...'
   * });
   * ```
   */
  const addAnswer = async (questionId, answerData) => {
    try {
      const newAnswer = await questionService.addAnswer(questionId, {
        ...answerData,
        userId: user.uid,
        authorName: user.displayName || 'Anonymous'
      });
      return newAnswer;
    } catch (error) {
      console.error('Error adding answer:', error);
      throw error;
    }
  };

  /**
   * Votes on a question (upvote or downvote)
   * 
   * @param {string} questionId - ID of the question
   * @param {string} voteType - Type of vote ('up' or 'down')
   * @returns {Promise<void>}
   * @throws {Error} If voting fails
   * 
   * Example usage:
   * ```js
   * const { voteQuestion } = useQuestion();
   * await voteQuestion('question123', 'up');
   * ```
   */
  const voteQuestion = async (questionId, voteType) => {
    try {
      await questionService.voteQuestion(questionId, voteType, user?.uid);
    } catch (error) {
      console.error('Error voting on question:', error);
      throw error;
    }
  };

  /**
   * Votes on an answer (upvote or downvote)
   * 
   * @param {string} answerId - ID of the answer
   * @param {string} voteType - Type of vote ('up' or 'down')
   * @returns {Promise<void>}
   * @throws {Error} If voting fails
   * 
   * Example usage:
   * ```js
   * const { voteAnswer } = useQuestion();
   * await voteAnswer('answer123', 'up');
   * ```
   */
  const voteAnswer = async (answerId, voteType) => {
    try {
      await questionService.voteAnswer(answerId, voteType);
    } catch (error) {
      console.error('Error voting on answer:', error);
      throw error;
    }
  };

  /**
   * Marks an answer as accepted for a question
   * 
   * @param {string} questionId - ID of the question
   * @param {string} answerId - ID of the answer to accept
   * @returns {Promise<void>}
   * @throws {Error} If accepting answer fails
   * 
   * Example usage:
   * ```js
   * const { acceptAnswer } = useQuestion();
   * await acceptAnswer('question123', 'answer123');
   * ```
   */
  const acceptAnswer = async (questionId, answerId) => {
    try {
      await questionService.acceptAnswer(questionId, answerId);
    } catch (error) {
      console.error('Error accepting answer:', error);
      throw error;
    }
  };

  /**
   * Updates the filters for question list
   * 
   * @param {Object} newFilters - New filter values to apply
   * 
   * Example usage:
   * ```js
   * const { updateFilters } = useQuestion();
   * updateFilters({ subject: 'Math', tags: ['calculus'] });
   * ```
   */
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Context value containing question state and functions
  const value = {
    questions,        // List of questions
    loading,          // Loading state
    filters,          // Current filter configuration
    createQuestion,   // Function to create new questions
    updateQuestion,   // Function to update existing questions
    addAnswer,        // Function to add answers
    voteQuestion,     // Function to vote on questions
    voteAnswer,       // Function to vote on answers
    acceptAnswer,     // Function to accept answers
    updateFilters     // Function to update filters
  };

  return (
    <QuestionContext.Provider value={value}>
      {children}
    </QuestionContext.Provider>
  );
};

/**
 * Custom hook to access question context
 */
export const useQuestion = () => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestion must be used within a QuestionProvider');
  }
  return context;
}; 
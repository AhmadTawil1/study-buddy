// src/context/questionContext.js
//
// QuestionProvider manages question data and filters for the StudyBuddy app.
// It provides the list of questions, loading state, filters, and logic to create/update/vote/answer questions via context.
// Used globally in app/layout.js to make questions data available everywhere.
//
// Features:
// - Subscribes to Firestore for real-time questions updates
// - Provides createQuestion, updateQuestion, addAnswer, voteQuestion, voteAnswer, acceptAnswer logic
// - Supports filters for subject, tags, userId
// - Exposes custom hook for use in components

'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { questionService } from '@/src/services/questionService';
import { useUser } from '@/src/context/userContext';

const QuestionContext = createContext();

export const QuestionProvider = ({ children }) => {
  const { user } = useUser();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: null,
    tags: [],
    userId: null
  });

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
   * Create a new question in Firestore
   * @param {Object} questionData - Data for the new question
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
   * Update an existing question in Firestore
   * @param {string} questionId - ID of the question
   * @param {Object} updateData - Fields to update
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
   * Add an answer to a question
   * @param {string} questionId - ID of the question
   * @param {Object} answerData - Data for the answer
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
   * Vote on a question
   * @param {string} questionId - ID of the question
   * @param {string} voteType - 'up' or 'down'
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
   * Vote on an answer
   * @param {string} answerId - ID of the answer
   * @param {string} voteType - 'up' or 'down'
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
   * Accept an answer for a question
   * @param {string} questionId - ID of the question
   * @param {string} answerId - ID of the answer
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
   * Update the filters for questions
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const value = {
    questions,
    loading,
    filters,
    createQuestion,
    updateQuestion,
    addAnswer,
    voteQuestion,
    voteAnswer,
    acceptAnswer,
    updateFilters
  };

  return (
    <QuestionContext.Provider value={value}>
      {children}
    </QuestionContext.Provider>
  );
};

/**
 * Custom hook to access question context
 * @returns {Object} Question context containing questions, loading, filters, and logic
 */
export const useQuestion = () => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestion must be used within a QuestionProvider');
  }
  return context;
}; 
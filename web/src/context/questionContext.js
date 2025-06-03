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

  const updateQuestion = async (questionId, updateData) => {
    try {
      await questionService.updateQuestion(questionId, updateData);
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  };

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

  const voteQuestion = async (questionId, voteType) => {
    try {
      await questionService.voteQuestion(questionId, voteType);
    } catch (error) {
      console.error('Error voting on question:', error);
      throw error;
    }
  };

  const voteAnswer = async (answerId, voteType) => {
    try {
      await questionService.voteAnswer(answerId, voteType);
    } catch (error) {
      console.error('Error voting on answer:', error);
      throw error;
    }
  };

  const acceptAnswer = async (questionId, answerId) => {
    try {
      await questionService.acceptAnswer(questionId, answerId);
    } catch (error) {
      console.error('Error accepting answer:', error);
      throw error;
    }
  };

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

export const useQuestion = () => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestion must be used within a QuestionProvider');
  }
  return context;
}; 
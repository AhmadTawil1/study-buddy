// src/context/requestContext.js
//
// RequestProvider manages help request data and filters for the StudyBuddy app.
// It provides the list of requests, loading state, filters, and logic to create/update requests via context.
// Used globally in app/layout.js to make requests data available everywhere.
//
// Features:
// - Subscribes to Firestore for real-time requests updates
// - Supports client-side search and filtering
// - Provides createRequest and updateRequest logic
// - Exposes custom hook for use in components

'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { requestService } from '@/src/services/requestService';
import { useUser } from '@/src/context/userContext';

const RequestContext = createContext();

export const RequestProvider = ({ children }) => {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: null,
    status: null,
    userId: null,
    timeRange: 'all',
    sortBy: 'newest',
    unanswered: false
  });

  useEffect(() => {
    console.log('RequestContext: subscribing to requests with filters:', filters);
    const unsubscribe = requestService.subscribeToRequests(
      (updatedRequests) => {
        setRequests(updatedRequests);
        setLoading(false);
      },
      filters
    );

    return () => unsubscribe();
  }, [filters]);

  /**
   * Create a new help request in Firestore
   * @param {Object} requestData - Data for the new request
   */
  const createRequest = async (requestData) => {
    try {
      const newRequest = await requestService.createRequest({
        ...requestData,
        userId: user?.uid
      });
      return newRequest;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  };

  /**
   * Update an existing help request in Firestore
   * @param {string} requestId - ID of the request
   * @param {Object} updateData - Fields to update
   */
  const updateRequest = async (requestId, updateData) => {
    try {
      await requestService.updateRequest(requestId, updateData);
    } catch (error) {
      console.error('Error updating request:', error);
      throw error;
    }
  };

  /**
   * Update the filters for requests
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const value = {
    requests,
    loading,
    filters,
    createRequest,
    updateRequest,
    updateFilters
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
};

/**
 * Custom hook to access request context
 * @returns {Object} Request context containing requests, loading, filters, and logic
 */
export const useRequest = () => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error('useRequest must be used within a RequestProvider');
  }
  return context;
}; 
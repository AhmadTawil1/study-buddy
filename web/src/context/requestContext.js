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
    difficulty: 'all',
    searchQuery: null
  });

  useEffect(() => {
    console.log('RequestContext: subscribing to requests with filters:', filters);
    const unsubscribe = requestService.subscribeToRequests(
      (updatedRequests) => {
        console.log('Fetched requests:', updatedRequests);
        setRequests(updatedRequests);
        setLoading(false);
      },
      filters
    );

    return () => unsubscribe();
  }, [filters]);

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

  const updateRequest = async (requestId, updateData) => {
    try {
      await requestService.updateRequest(requestId, updateData);
    } catch (error) {
      console.error('Error updating request:', error);
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

export const useRequest = () => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error('useRequest must be used within a RequestProvider');
  }
  return context;
}; 
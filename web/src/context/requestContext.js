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

/**
 * requestContext.js
 * 
 * This module provides request state management for the StudyBuddy application.
 * It implements a context system that handles:
 * - Real-time request data synchronization with Firestore
 * - Request filtering and search functionality
 * - Request creation and updates
 * - Loading states and error handling
 * 
 * The context is used globally to provide consistent access to request data
 * and management functions across all components.
 */

'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { requestService } from '@/src/services/requests/requestService';
import { useUser } from '@/src/context/userContext';

/**
 * RequestContext
 * 
 * Context object that will hold the request state and related functions.
 * Initialized as undefined and will be populated by the RequestProvider.
 */
const RequestContext = createContext();

/**
 * RequestProvider Component
 * 
 * Manages study request data and provides filtering capabilities.
 * Handles real-time updates and request management operations.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped with request context
 */
export const RequestProvider = ({ children }) => {
  const { user } = useUser();
  
  // State for list of requests
  const [requests, setRequests] = useState([]);
  // Loading state for initial data fetch
  const [loading, setLoading] = useState(true);
  
  // Default filter configuration
  const [filters, setFilters] = useState({
    subject: null,      // Filter by subject
    status: null,       // Filter by request status
    userId: null,       // Filter by user ID
    timeRange: 'all',   // Filter by time range
    sortBy: 'newest',   // Sort order
    unanswered: false   // Filter for unanswered requests
  });

  /**
   * Effect hook to handle real-time request updates
   * - Subscribes to Firestore for request changes
   * - Updates local state when changes occur
   * - Cleans up subscription on unmount
   * - Re-subscribes when filters change
   */
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
   * Creates a new help request in Firestore
   * 
   * @param {Object} requestData - Data for the new request
   * @returns {Promise<Object>} The created request object
   * @throws {Error} If request creation fails
   * 
   * Example usage:
   * ```js
   * const { createRequest } = useRequest();
   * const newRequest = await createRequest({
   *   title: 'Help with Calculus',
   *   description: 'Need help with derivatives'
   * });
   * ```
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
   * Updates an existing help request in Firestore
   * 
   * @param {string} requestId - ID of the request to update
   * @param {Object} updateData - Fields to update
   * @returns {Promise<void>}
   * @throws {Error} If request update fails
   * 
   * Example usage:
   * ```js
   * const { updateRequest } = useRequest();
   * await updateRequest('request123', { status: 'completed' });
   * ```
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
   * Updates the filters for request list
   * 
   * @param {Object} newFilters - New filter values to apply
   * 
   * Example usage:
   * ```js
   * const { updateFilters } = useRequest();
   * updateFilters({ subject: 'Math', status: 'open' });
   * ```
   */
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Context value containing request state and functions
  const value = {
    requests,        // List of requests
    loading,         // Loading state
    filters,         // Current filter configuration
    createRequest,   // Function to create new requests
    updateRequest,   // Function to update existing requests
    updateFilters    // Function to update filters
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
};

/**
 * Custom hook to access request context
 * 
 * @returns {Object} Request context containing:
 *   - requests: Array of request objects
 *   - loading: Loading state for requests
 *   - filters: Current filter configuration
 *   - createRequest: Function to create new requests
 *   - updateRequest: Function to update existing requests
 *   - updateFilters: Function to update filters
 * 
 * @throws {Error} If used outside of RequestProvider
 * 
 * Example usage:
 * ```js
 * const { requests, loading, createRequest } = useRequest();
 * ```
 */
export const useRequest = () => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error('useRequest must be used within a RequestProvider');
  }
  return context;
}; 
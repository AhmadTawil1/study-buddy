// src/context/notificationContext.js
//
// NotificationProvider manages notifications for the StudyBuddy app.
// It provides the list of notifications, unread count, loading state, and logic to mark/read/delete notifications via context.
// Used globally in app/layout.js to make notifications available everywhere.
//
// Features:
// - Subscribes to Firestore for real-time notifications updates
// - Provides markAsRead, markAllAsRead, deleteNotification logic
// - Exposes custom hook for use in components

/**
 * notificationContext.js
 * 
 * This module provides notification state management for the StudyBuddy application.
 * It implements a context system that handles:
 * - Real-time notification synchronization with Firestore
 * - Notification read/unread status management
 * - Notification deletion
 * - Unread count tracking
 * - Loading states and error handling
 * 
 * The context is used globally to provide consistent access to notification data
 * and management functions across all components.
 */

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '@/src/services/notificationService';
import { useAuth } from '@/src/context/authContext';

/**
 * NotificationContext
 * 
 * Context object that will hold the notification state and related functions.
 * Initialized as undefined and will be populated by the NotificationProvider.
 */
const NotificationContext = createContext();

/**
 * Custom hook to access notification context
 * 
 * @returns {Object} Notification context containing:
 *   - notifications: Array of notification objects
 *   - unreadCount: Number of unread notifications
 *   - loading: Loading state for notifications
 *   - markAsRead: Function to mark a notification as read
 *   - markAllAsRead: Function to mark all notifications as read
 *   - deleteNotification: Function to delete a notification
 * 
 * @throws {Error} If used outside of NotificationProvider
 * 
 * Example usage:
 * ```js
 * const { notifications, unreadCount, markAsRead } = useNotifications();
 * ```
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

/**
 * NotificationProvider Component
 * 
 * Manages notification data and provides notification-related operations.
 * Handles real-time updates and notification management operations.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped with notification context
 */
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  
  // State for list of notifications
  const [notifications, setNotifications] = useState([]);
  // State for tracking unread notifications count
  const [unreadCount, setUnreadCount] = useState(0);
  // Loading state for initial data fetch
  const [loading, setLoading] = useState(true);

  /**
   * Effect hook to handle real-time notification updates
   * - Subscribes to Firestore for notification changes
   * - Updates local state when changes occur
   * - Updates unread count
   * - Cleans up subscription on unmount
   * - Re-subscribes when user changes
   */
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = notificationService.subscribeToNotifications(
      user.uid,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter(n => !n.read).length);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  /**
   * Marks a single notification as read
   * 
   * @param {string} notificationId - ID of the notification to mark as read
   * @returns {Promise<void>}
   * 
   * Example usage:
   * ```js
   * const { markAsRead } = useNotifications();
   * await markAsRead('notification123');
   * ```
   */
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  /**
   * Marks all notifications as read for the current user
   * 
   * @returns {Promise<void>}
   * 
   * Example usage:
   * ```js
   * const { markAllAsRead } = useNotifications();
   * await markAllAsRead();
   * ```
   */
  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.uid);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  /**
   * Deletes a notification
   * 
   * @param {string} notificationId - ID of the notification to delete
   * @returns {Promise<void>}
   * 
   * Example usage:
   * ```js
   * const { deleteNotification } = useNotifications();
   * await deleteNotification('notification123');
   * ```
   */
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Context value containing notification state and functions
  const value = {
    notifications,     // List of notifications
    unreadCount,       // Count of unread notifications
    loading,           // Loading state
    markAsRead,        // Function to mark a notification as read
    markAllAsRead,     // Function to mark all notifications as read
    deleteNotification // Function to delete a notification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 
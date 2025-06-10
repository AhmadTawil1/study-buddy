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

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '@/src/services/notificationService';
import { useAuth } from '@/src/context/authContext';

const NotificationContext = createContext();

/**
 * Custom hook to access notification context
 * @returns {Object} Notification context containing notifications, unreadCount, loading, and logic
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
   * Mark a notification as read
   * @param {string} notificationId - ID of the notification
   */
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  /**
   * Mark all notifications as read for the current user
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
   * Delete a notification
   * @param {string} notificationId - ID of the notification
   */
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 
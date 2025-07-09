// src/services/notificationService.js
//
// This service manages user notifications in the StudyBuddy platform.
// It handles creating, reading, updating, and deleting notifications
// for various user activities like answers, upvotes, etc.
//
// Features:
// - Real-time notification subscriptions
// - Batch operations for efficiency
// - Unread count tracking
// - Notification lifecycle management

import { db } from '@/src/firebase/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy,  
  getDocs, 
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

export const notificationService = {
  /**
   * Retrieves all notifications for a specific user
   * @param {string} userId - The user ID to fetch notifications for
   * @returns {Promise<Array>} Array of notification objects
   */
  getNotifications: async (userId) => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc') // Most recent notifications first
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  /**
   * Sets up a real-time subscription to user notifications
   * @param {string} userId - The user ID to subscribe to
   * @param {function} callback - Function called when notifications change
   * @returns {function} Unsubscribe function
   */
  subscribeToNotifications: (userId, callback) => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    // Return the unsubscribe function for cleanup
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    });
  },

  /**
   * Creates a new notification for a user
   * @param {object} notificationData - Notification data including userId, type, message, etc.
   * @returns {Promise<object>} The created notification with ID
   */
  createNotification: async (notificationData) => {
    const notificationsRef = collection(db, 'notifications');
    const newNotification = {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false // New notifications are unread by default
    };
    
    const docRef = await addDoc(notificationsRef, newNotification);
    return {
      id: docRef.id,
      ...newNotification
    };
  },

  /**
   * Marks a single notification as read
   * @param {string} notificationId - The notification ID to mark as read
   * @returns {Promise<void>}
   */
  markAsRead: async (notificationId) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp() // Track when notification was read
    });
  },

  /**
   * Marks all unread notifications for a user as read
   * Uses batch operations for efficiency
   * @param {string} userId - The user ID whose notifications to mark as read
   * @returns {Promise<void>}
   */
  markAllAsRead: async (userId) => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false) // Only unread notifications
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    // Add all unread notifications to the batch update
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: serverTimestamp()
      });
    });

    // Execute all updates in a single batch operation
    await batch.commit();
  },

  /**
   * Deletes a specific notification
   * @param {string} notificationId - The notification ID to delete
   * @returns {Promise<void>}
   */
  deleteNotification: async (notificationId) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
  }
}; 
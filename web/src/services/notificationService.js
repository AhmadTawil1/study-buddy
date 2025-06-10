import { db } from '@/src/firebase/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';

export const notificationService = {
  // Get user notifications
  getNotifications: async (userId) => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Subscribe to notifications
  subscribeToNotifications: (userId, callback) => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    });
  },

  // Create a notification
  createNotification: async (notificationData) => {
    const notificationsRef = collection(db, 'notifications');
    const newNotification = {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false
    };
    
    const docRef = await addDoc(notificationsRef, newNotification);
    return {
      id: docRef.id,
      ...newNotification
    };
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
  },

  // Mark all notifications as read
  markAllAsRead: async (userId) => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: serverTimestamp()
      });
    });

    await batch.commit();
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
  },

  // Get unread notification count
  getUnreadCount: async (userId) => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  }
}; 
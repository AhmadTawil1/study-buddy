// src/services/chatService.js
// Firestore-based private chat service for StudyBuddy

import { db } from '@/src/firebase/firebase';
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

export const chatService = {
  /**
   * Finds or creates a private chat between two users.
   * @param {string} userA - First user ID
   * @param {string} userB - Second user ID
   * @returns {Promise<string>} Chat document ID
   */
  async findOrCreateChat(userA, userB) {
    const participants = [userA, userB].sort();
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', '==', participants)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
    // Create new chat
    const docRef = await addDoc(chatsRef, {
      participants,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  /**
   * Fetches all chats for a user (real-time listener)
   * @param {string} userId
   * @param {function} callback - Called with array of chat docs
   * @returns {function} Unsubscribe function
   */
  subscribeToUserChats(userId, callback) {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(chats);
    });
  },

  /**
   * Sends a message in a chat
   * @param {string} chatId
   * @param {object} messageData - { text, sender, type, ... }
   * @returns {Promise<void>}
   */
  async sendMessage(chatId, messageData) {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      ...messageData,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Subscribes to messages in a chat (real-time)
   * @param {string} chatId
   * @param {function} callback - Called with array of messages
   * @returns {function} Unsubscribe function
   */
  subscribeToMessages(chatId, callback) {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(messages);
    });
  },
}; 
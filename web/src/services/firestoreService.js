// src/services/firestoreService.js
//
// This service provides a simplified interface for common Firestore operations.
// It abstracts away the complexity of Firestore queries and provides consistent
// data formatting across the application.
//
// Features:
// - CRUD operations (Create, Read, Update, Delete)
// - Automatic timestamp management
// - Consistent data structure formatting
// - Error handling for common operations

import { db } from '@/src/firebase/firebase'
import { collection, addDoc, getDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'

export const firestoreService = {
  /**
   * Adds a new document to a specified collection
   * @param {string} collectionName - Name of the Firestore collection
   * @param {object} data - Document data to be added
   * @returns {Promise<string>} The ID of the newly created document
   */
  addDocument: async (collectionName, data) => {
    const ref = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(), // Automatically add creation timestamp
    });
    return ref.id; // Return the document ID
  },

  /**
   * Retrieves a document by its ID from a specified collection
   * @param {string} collectionName - Name of the Firestore collection
   * @param {string} docId - Document ID to retrieve
   * @returns {Promise<object|null>} Document data with ID or null if not found
   */
  getDocument: async (collectionName, docId) => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    // Return document data with ID if it exists, otherwise null
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  /**
   * Updates an existing document in a specified collection
   * @param {string} collectionName - Name of the Firestore collection
   * @param {string} docId - Document ID to update
   * @param {object} data - Updated data to merge with existing document
   * @returns {Promise<void>}
   */
  updateDocument: async (collectionName, docId, data) => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { 
      ...data, 
      updatedAt: serverTimestamp() // Automatically add update timestamp
    });
  },

  /**
   * Deletes a document from a specified collection
   * @param {string} collectionName - Name of the Firestore collection
   * @param {string} docId - Document ID to delete
   * @returns {Promise<void>}
   */
  deleteDocument: async (collectionName, docId) => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  }
};

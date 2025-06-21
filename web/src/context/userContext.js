/**
 * userContext.js
 * 
 * This module provides user state management for the StudyBuddy application.
 * It implements a context system that handles:
 * - Firebase Authentication state
 * - Firestore user profile data
 * - Profile updates and synchronization
 * - Loading states and error handling
 * 
 * The context is used globally in the application to provide
 * consistent access to user data across all components.
 */

'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/src/firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/firebase/firebase';

/**
 * UserContext
 * 
 * Context object that will hold the user state and related functions.
 * Initialized as undefined and will be populated by the UserProvider.
 */
const UserContext = createContext();

/**
 * UserProvider Component
 * 
 * Manages user authentication state and profile data.
 * Provides user information and update capabilities to child components.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped with user context
 */
export const UserProvider = ({ children }) => {
  // State for Firebase Auth user
  const [user, setUser] = useState(null);
  // Loading state for initial data fetch
  const [loading, setLoading] = useState(true);
  // State for user profile data from Firestore
  const [userProfile, setUserProfile] = useState(null);

  /**
   * Effect hook to handle authentication state changes
   * - Listens for Firebase Auth state changes
   * - Fetches user profile from Firestore when user is authenticated
   * - Cleans up subscription on unmount
   */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile({
              id: userDoc.id,
              ...userDoc.data()
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Updates the user's profile in Firestore and local state
   * 
   * @param {Object} updates - Object containing fields to update
   * @returns {Promise<boolean>} - True if update was successful, false otherwise
   * 
   * Example usage:
   * ```js
   * const { updateUserProfile } = useUser();
   * await updateUserProfile({ displayName: 'New Name' });
   * ```
   */
  const updateUserProfile = async (updates) => {
    if (!user) return false;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
      
      // Update local state with new data
      setUserProfile(prev => ({
        ...prev,
        ...updates
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };

  // Context value containing user state and functions
  const value = {
    user,           // Firebase Auth user object
    userProfile,    // User profile data from Firestore
    loading,        // Loading state for initial data fetch
    updateUserProfile // Function to update user profile
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

/**
 * Custom hook to access user context

 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 
// src/context/userContext.js
//
// UserProvider manages user profile data for the StudyBuddy app.
// It provides the current Firebase user, user profile from Firestore, loading state, and update logic via context.
// Used globally in app/layout.js to make user data available everywhere.
//
// Features:
// - Listens for Firebase Auth state changes
// - Fetches user profile from Firestore
// - Provides updateUserProfile to update Firestore user data
// - Exposes custom hook for use in components

'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/src/firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/firebase/firebase';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile({
            id: userDoc.id,
            ...userDoc.data()
          });
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Update the user's profile in Firestore and local state
   * @param {Object} updates - Fields to update
   */
  const updateUserProfile = async (updates) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
      
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

  const value = {
    user,
    userProfile,
    loading,
    updateUserProfile
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

/**
 * Custom hook to access user context
 * @returns {Object} User context containing user, userProfile, loading, and updateUserProfile
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 
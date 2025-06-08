'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth'
import { auth } from '@/src/firebase/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/src/firebase/firebase'

const AuthContext = createContext()

/**
 * AuthProvider component that manages authentication state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 */
export function AuthProvider({ children }) {
  // State to store the current user and loading status
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Effect to listen for authentication state changes
  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser)
      setLoading(false)
      // Ensure Firestore user doc exists for all users
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: currentUser.email,
            name: currentUser.displayName || '',
            nickname: '', // You may want to prompt for this later
            joinDate: serverTimestamp(),
            role: 'student',
            bio: '',
            subjects: [],
            rating: 0,
            totalRatings: 0,
            emailVerified: currentUser.emailVerified || false,
            provider: currentUser.providerData[0]?.providerId || 'unknown'
          })
        }
      }
    })
    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  /**
   * Function to handle user logout
   * Signs out the user from Firebase and updates the local state
   */
  const logout = async () => {
    setLoading(true)
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  // Provide authentication context to children components
  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context containing user, loading state, and logout function
 */
export const useAuth = () => useContext(AuthContext)

export const signInWithGoogle = async () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signInWithGithub = async () => {
  const auth = getAuth();
  const provider = new GithubAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signInWithMicrosoft = async () => {
  const auth = getAuth();
  const provider = new OAuthProvider('microsoft.com');
  return signInWithPopup(auth, provider);
};


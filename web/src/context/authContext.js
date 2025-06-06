'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/src/firebase/firebase'

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
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser)
      setLoading(false)
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


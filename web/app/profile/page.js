// Profile Page Route: /profile (current user)
// Purpose: Shows user profile info and stats. Redirects unauthenticated users.
// Theme: Uses theme context for background and text color.

'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import ProfileView from '@/src/features/profile/ProfileView'
import { useTheme } from '@/src/context/themeContext'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { colors } = useTheme();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      }
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div className="min-h-screen py-12 px-4 text-center">Loading or redirecting...</div>
  }

  // Render the profile view
  return (
    <div style={{ minHeight: '100vh', background: colors.page, color: colors.text }}>
      <ProfileView />
    </div>
  )
}
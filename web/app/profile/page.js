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

  return (
    <div style={{ minHeight: '100vh', background: colors.page, color: colors.text }}>
      <ProfileView />
    </div>
  )
}
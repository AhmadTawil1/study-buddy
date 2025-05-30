'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import ProfileView from '@/src/features/profile/ProfileView'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div className="min-h-screen py-12 px-4 text-center">Loading or redirecting...</div>
  }

  return (
    <div className="py-12 px-4">
      <ProfileView />
    </div>
  )
}
'use client'
import ProfileView from '@/src/features/profile/ProfileView'

export default function ProfilePage() {
  return (
    <div className="py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-8">My Profile</h1>
      <ProfileView />
    </div>
  )
}
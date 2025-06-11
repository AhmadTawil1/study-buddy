'use client'
import { use } from 'react'
import ProfileView from '@/src/features/profile/ProfileView'

export default function PublicProfilePage({ params }) {
  const { id } = use(params)
  return (
    <div className="py-12 px-4">
      <ProfileView userId={id} />
    </div>
  );
} 
'use client'
import { use } from 'react'
import PublicProfileView from '@/src/features/profile/PublicProfileView'

export default function PublicProfilePage({ params }) {
  const { id } = use(params)
  return (
    <div className="py-12 px-4">
      <PublicProfileView userId={id} />
    </div>
  );
} 
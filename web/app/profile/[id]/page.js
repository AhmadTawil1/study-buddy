'use client'
import { use } from 'react'
import PublicProfileView from '@/src/features/profile/PublicProfileView'
import { useTheme } from '@/src/context/themeContext'

export default function PublicProfilePage({ params }) {
  const { id } = use(params)
  const { colors } = useTheme();
  return (
    <div style={{ minHeight: '100vh', background: colors.page }} className="py-12 px-4">
      <PublicProfileView userId={id} />
    </div>
  );
} 
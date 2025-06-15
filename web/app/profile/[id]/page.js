// Public Profile Page Route: /profile/[id]
// Purpose: Shows another user's public profile info and stats.
// Theme: Uses theme context for background and text color.

'use client'
import { use } from 'react'
import PublicProfileView from '@/src/features/profile/PublicProfileView'
import { useTheme } from '@/src/context/themeContext'

export default function PublicProfilePage({ params }) {
  const { id } = use(params)
  const { colors } = useTheme();
  // Render the public profile view for the given userId
  return (
    <div style={{ minHeight: '100vh', background: colors.page }} className="py-12 px-4">
      <PublicProfileView userId={id} />
    </div>
  );
} 
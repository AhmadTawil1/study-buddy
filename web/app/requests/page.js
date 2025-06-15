// Requests Page Route: /requests
// Purpose: Shows a feed of all help requests for browsing and filtering.
// Theme: Uses theme context for background, card, and text color.
// Features: Header, request feed, filtering (in feed component).

'use client'
import RequestFeed from '@/src/features/requests/RequestFeed'
import { useTheme } from '@/src/context/themeContext'

export default function RequestsPage() {
  const { mode, colors } = useTheme();
  // Render the requests page with header and feed
  return (
    <div className="min-h-screen" style={{ background: colors.page, color: colors.text }}>
      {/* Header */}
      <div className="border-b shadow-md rounded-lg mx-4 mt-4" style={{ background: colors.card }}>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>Help Requests</h1>
          <p style={{ color: colors.inputPlaceholder }}>Browse, filter, and contribute to help requests</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <RequestFeed />
      </div>
    </div>
  )
}

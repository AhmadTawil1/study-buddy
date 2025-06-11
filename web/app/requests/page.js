'use client'
import RequestFeed from '@/src/features/requests/RequestFeed'

export default function RequestsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-md rounded-lg mx-4 mt-4">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Requests</h1>
          <p className="text-gray-600">Browse, filter, and contribute to help requests</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <RequestFeed />
      </div>
    </div>
  )
}

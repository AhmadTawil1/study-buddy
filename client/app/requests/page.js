'use client'
import RequestFeed from '@/src/features/requests/RequestFeed'

export default function RequestsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-8">All Help Requests</h1>
      <RequestFeed />
    </div>
  )
}

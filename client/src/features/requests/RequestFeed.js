'use client'
import Link from 'next/link'

const mockRequests = [
  { id: '123', title: 'Can someone help with Linear Algebra?' },
  { id: '456', title: 'Stuck on recursion in JavaScript' },
]

export default function RequestFeed() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {mockRequests.map(req => (
        <div
          key={req.id}
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold text-blue-700">{req.title}</h3>
          <p className="text-sm text-gray-600 mt-2">Posted 2h ago</p>
          <Link
            href={`/requests/${req.id}`}
            className="text-sm text-blue-600 hover:underline mt-4 inline-block"
          >
            View Details →
          </Link>
        </div>
      ))}
    </div>
  )
}

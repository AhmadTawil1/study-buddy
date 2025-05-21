'use client'
import Link from 'next/link'

const mockRequests = [
  {
    id: '123',
    title: 'Can someone explain linear regression?',
    tag: 'AI',
    time: '2h ago',
    summary: 'I’m struggling with how the cost function works and what gradient descent is doing.'
  },
  {
    id: '456',
    title: 'How to solve 3-variable equations in Python?',
    tag: 'Math',
    time: '1d ago',
    summary: 'I want to learn how to use numpy to solve multiple equations together.'
  }
]

export default function RequestFeed() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {mockRequests.map((req) => (
        <div
          key={req.id}
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">{req.time}</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{req.tag}</span>
          </div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">{req.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">{req.summary}</p>
          <Link
            href={`/requests/${req.id}`}
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            View Details →
          </Link>
        </div>
      ))}
    </div>
  )
}

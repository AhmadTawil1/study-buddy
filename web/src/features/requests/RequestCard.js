'use client'
import Link from 'next/link'
import { BookmarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import pluralize from '@/src/utils/pluralize'

export default function RequestCard({ id, title, description, timeAgo, author, tags, answersCount }) {
  const [bookmarked, setBookmarked] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{timeAgo} • by {author}</p>
        </div>
        <button
          className={`text-gray-400 hover:text-blue-600 transition-colors ${bookmarked ? 'text-blue-600' : ''}`}
          title={bookmarked ? 'Bookmarked' : 'Bookmark'}
          aria-label="Bookmark"
          onClick={() => setBookmarked(b => !b)}
        >
          <BookmarkIcon className="h-5 w-5" />
        </button>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center text-gray-500 text-sm">
          <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
          {pluralize(answersCount, 'answer')}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/requests/${id}`}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            title="View details of this request"
            aria-label="View details"
          >
            View
          </Link>
          <button
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            title="Offer help on this request"
            aria-label="Help"
          >
            Help
          </button>
        </div>
      </div>
    </div>
  )
} 
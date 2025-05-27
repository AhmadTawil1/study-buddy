// ... existing code ...
"use client"
import { FiBookmark, FiShare2, FiThumbsUp } from 'react-icons/fi'

export default function QuestionOverview({ request }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{request.title}</h1>
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{request.subject}</span>
        <span className="text-gray-600 text-xs">{request.author} • {request.timeAgo}</span>
      </div>
      <div className="flex gap-4 mb-4">
        <button className="flex items-center gap-1 text-blue-600 font-medium hover:underline"><FiThumbsUp /> Upvote</button>
        <button className="flex items-center gap-1 text-blue-600 font-medium hover:underline"><FiBookmark /> Save</button>
        <button className="flex items-center gap-1 text-blue-600 font-medium hover:underline"><FiShare2 /> Share</button>
      </div>
    </div>
  )
}
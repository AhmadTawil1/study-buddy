"use client"
import Link from 'next/link'
export default function Sidebar({ relatedQuestions, aiSuggestions, aiVideos }) {
  return (
    <aside className="sticky top-8 space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2 text-gray-800">Related Questions</h3>
        <ul className="mb-4">
          {relatedQuestions.map(q => (
            <li key={q.id}><a href={`/requests/${q.id}`} className="text-blue-600 hover:underline">{q.title}</a></li>
          ))}
        </ul>
        <Link href="/ask" className="block">
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 w-full mb-4">Ask a new question</button>
        </Link>
        <div className="bg-blue-50 p-3 rounded">
          <strong className="text-gray-800">AI Suggestions:</strong>
          <div className="text-gray-700">{aiSuggestions}</div>
        </div>
      </div>

      {/* AI Suggested Videos & Resources Section */}
      {aiVideos}
    </aside>
  )
}
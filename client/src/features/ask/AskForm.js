'use client'
import { rephraseQuestion } from '@/src/services/aiService'
import { useState } from 'react'

export default function AskForm() {
  const [title, setTitle] = useState('')
  const [rephrased, setRephrased] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRephrase = async () => {
    setLoading(true)
    const result = await rephraseQuestion(title)
    setRephrased(result)
    setLoading(false)
  }

  return (
    <form className="space-y-6 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-blue-700 font-semibold mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your question title"
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
        <button
          type="button"
          onClick={handleRephrase}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          {loading ? 'Rephrasing...' : 'Rephrase with AI'}
        </button>
        {rephrased && (
          <p className="mt-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
            <strong>AI Suggestion:</strong> {rephrased}
          </p>
        )}
      </div>

      <div>
        <label className="block text-blue-700 font-semibold mb-1">Description</label>
        <textarea
          rows="5"
          placeholder="Describe your question..."
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  )
}

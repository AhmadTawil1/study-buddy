'use client'
import { useState } from 'react'
import { rephraseQuestion } from '@/src/services/aiService'

export default function AskForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rephrased, setRephrased] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRephrase = async () => {
    if (!title.trim()) return
    setLoading(true)
    const result = await rephraseQuestion(title)
    setRephrased(result)
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Integrate with Firebase in Sprint 2
    console.log('Submit:', { title, description })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow"
    >
      {/* Title + AI Button */}
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
          disabled={loading || !title.trim()}
          className="mt-2 text-sm text-blue-600 hover:underline disabled:opacity-50"
        >
          {loading ? 'Rephrasing...' : 'Rephrase with AI'}
        </button>
        {rephrased && (
          <p className="mt-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
            <strong>AI Suggestion:</strong> {rephrased}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-blue-700 font-semibold mb-1">Description</label>
        <textarea
          rows="5"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your question..."
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  )
}

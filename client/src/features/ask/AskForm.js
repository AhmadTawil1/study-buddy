'use client'
import { useState } from 'react'
import { rephraseQuestion } from '@/src/services/aiService'

export default function AskForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rephrased, setRephrased] = useState('')
  const [subject, setSubject] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rephrasedDesc, setRephrasedDesc] = useState('')
  const [descLoading, setDescLoading] = useState(false)


  const handleRephrase = async () => {
    if (!title.trim()) return
    setLoading(true)
    const result = await rephraseQuestion(title)
    setRephrased(result || 'Could not rephrase')
    setLoading(false)
  }

  const handleRephraseDescription = async () => {
  if (!description.trim()) return
  setDescLoading(true)
  const result = await rephraseQuestion(description)
  setRephrasedDesc(result || 'Could not rephrase')
  setDescLoading(false)
  }


  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ title, description, subject, file })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xl border border-gray-100 space-y-6"
    >
      {/* Title */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your question title"
          className="w-full border border-gray-300 px-4 py-2 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleRephrase}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          {loading ? 'Rephrasing...' : 'Rephrase with AI'}
        </button>
        {rephrased && (
          <p className="mt-2 bg-blue-50 text-blue-800 text-sm px-4 py-2 rounded-md">
            <strong>AI Suggestion:</strong> {rephrased}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Describe your question..."
          className="w-full border border-gray-300 px-4 py-2 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="button"
          onClick={handleRephraseDescription}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          {descLoading ? 'Rephrasing...' : 'Rephrase Description with AI'}
        </button>

        {rephrasedDesc && (
          <div className="mt-2 bg-blue-50 text-blue-800 text-sm px-4 py-2 rounded">
            <p>
              <strong>AI Suggestion:</strong> {rephrasedDesc}
            </p>
            <button
              type="button"
              onClick={() => setDescription(rephrasedDesc)}
              className="mt-1 text-xs text-blue-500 hover:underline"
            >
              Use this version
            </button>
          </div>
        )}
      </div>



      {/* File Upload */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Upload File (optional)</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-sm file:text-sm file:border-0 file:bg-blue-50 file:text-blue-700"
        />
        {file && <p className="mt-1 text-xs text-gray-600">Selected: {file.name}</p>}
      </div>

      {/* Subject */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Subject</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Subject</option>
          <option value="math">Math</option>
          <option value="cs">Computer Science</option>
          <option value="physics">Physics</option>
          <option value="ai">AI</option>
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  )
}

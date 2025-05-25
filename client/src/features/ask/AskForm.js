'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import { rephraseQuestion } from '@/src/services/aiService'
import { createRequest } from '@/src/services/firestoreService'

export default function AskForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [file, setFile] = useState(null)

  const [aiTitle, setAiTitle] = useState('')
  const [aiDescription, setAiDescription] = useState('')
  const [loadingTitle, setLoadingTitle] = useState(false)
  const [loadingDescription, setLoadingDescription] = useState(false)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const { user } = useAuth()

  const handleRephraseTitle = async () => {
    if (!title.trim()) return
    setLoadingTitle(true)
    const result = await rephraseQuestion(title)
    setAiTitle(result || '⚠️ Could not rephrase title')
    setLoadingTitle(false)
  }

  const handleRephraseDescription = async () => {
    if (!description.trim()) return
    setLoadingDescription(true)
    const result = await rephraseQuestion(description)
    setAiDescription(result || '⚠️ Could not rephrase description')
    setLoadingDescription(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (!title || !description || !subject) {
        setError('All fields are required.')
        setLoading(false)
        return
      }

      if (!user) {
        setError('You must be logged in.')
        setLoading(false)
        return
      }

      const request = {
        title,
        description,
        subject,
        userId: user.uid,
        userEmail: user.email,
        fileName: file?.name || null,
      }

      await createRequest(request)

      setSuccess(true)
      setTimeout(() => {
        router.push('/requests')
      }, 1200)
    } catch (err) {
      console.error('Submit error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xl border border-gray-100 space-y-6">
      {/* Feedback */}
      {success && <div className="success-message">✅ Question submitted successfully!</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Title */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter your question title"
          className="w-full border border-gray-300 px-4 py-2 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="button" onClick={handleRephraseTitle} className="mt-2 text-sm text-blue-600 hover:underline">
          {loadingTitle ? 'Rephrasing...' : 'Rephrase with AI'}
        </button>
        {aiTitle && (
          <div className="mt-2 bg-blue-50 text-blue-800 text-sm px-4 py-2 rounded-md">
            <p><strong>AI Suggestion:</strong> {aiTitle}</p>
            <button type="button" onClick={() => setTitle(aiTitle)} className="mt-1 text-xs text-blue-500 hover:underline">
              Use this version
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={5}
          placeholder="Describe your question..."
          className="w-full border border-gray-300 px-4 py-2 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="button" onClick={handleRephraseDescription} className="mt-2 text-sm text-blue-600 hover:underline">
          {loadingDescription ? 'Rephrasing...' : 'Rephrase Description with AI'}
        </button>
        {aiDescription && (
          <div className="mt-2 bg-blue-50 text-blue-800 text-sm px-4 py-2 rounded-md">
            <p><strong>AI Suggestion:</strong> {aiDescription}</p>
            <button type="button" onClick={() => setDescription(aiDescription)} className="mt-1 text-xs text-blue-500 hover:underline">
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
          onChange={e => setFile(e.target.files[0])}
          className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-sm file:text-sm file:border-0 file:bg-blue-50 file:text-blue-700"
        />
        {file && <p className="mt-1 text-xs text-gray-600">Selected: {file.name}</p>}
      </div>

      {/* Subject */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Subject</label>
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
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
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}

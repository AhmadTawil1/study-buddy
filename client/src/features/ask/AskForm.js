'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import { rephraseQuestion } from '@/src/services/aiService'
import { createRequest } from '@/src/services/firestoreService'
import { FiUpload, FiCode, FiLock, FiGlobe } from 'react-icons/fi'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'

const MAX_TITLE_LENGTH = 100
const SUBJECTS = ['Math', 'Physics', 'Computer Science', 'Chemistry', 'Biology', 'Other']

export default function AskForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [tags, setTags] = useState([])
  const [isPrivate, setIsPrivate] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [files, setFiles] = useState([])
  const [codeSnippet, setCodeSnippet] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [customTag, setCustomTag] = useState('')
  const [clarityScore, setClarityScore] = useState(null)
  const [aiTitle, setAiTitle] = useState('')
  const [loadingTitle, setLoadingTitle] = useState(false)
  const [loadingDescription, setLoadingDescription] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const fileInputRef = useRef(null)
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
    setDescription(result || description)
    setLoadingDescription(false)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      return validTypes.includes(file.type)
    })
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag])
      setCustomTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const calculateClarityScore = (text) => {
    // Simple scoring based on length, question marks, and specific words
    let score = 5 // Base score
    if (text.length > 20) score += 1
    if (text.includes('?')) score += 1
    if (text.includes('how') || text.includes('what') || text.includes('why')) score += 1
    if (text.length > 50) score += 1
    return Math.min(10, score)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    console.log('Attempting to submit form...')
    console.log('Form values:', { title, description, subject, tags, isPrivate, isAnonymous, files: files.map(f => f.name), codeSnippet, clarityScore })

    try {
      if (!title || !description || !subject) {
        const errorMessage = 'Title, description, and subject are required.'
        setError(errorMessage)
        console.error('Validation failed:', errorMessage)
        setLoading(false)
        return
      }

      if (!user) {
        const errorMessage = 'You must be logged in to ask a question.'
        setError(errorMessage)
        console.error('Authentication check failed:', errorMessage)
        setLoading(false)
        return
      }

      const request = {
        title,
        description,
        subject,
        tags,
        isPrivate,
        isAnonymous,
        userId: isAnonymous ? null : user.uid,
        userEmail: isAnonymous ? null : user.email,
        authorName: isAnonymous ? 'Anonymous' : (user.displayName || user.email),
        files: files.map(f => f.name),
        codeSnippet: codeSnippet || null,
        clarityScore: calculateClarityScore(title),
        createdAt: new Date(),
      }

      console.log('Validation passed. Attempting to create request:', request)

      await createRequest(request)
      console.log('Request created successfully!')
      setSuccess(true)
      setTimeout(() => {
        router.push('/requests')
      }, 1200)
    } catch (err) {
      console.error('Submit error during createRequest:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      console.log('Form submission process finished.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Ask a Question</h1>
        <p className="text-gray-600 mb-8">Be clear. Be specific. We'll help.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 text-green-700 p-4 rounded-lg"
              >
                ✅ Question submitted successfully!
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 text-red-700 p-4 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
              <span className="text-gray-500 ml-2">
                {title.length}/{MAX_TITLE_LENGTH}
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={e => {
                  setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))
                  setClarityScore(calculateClarityScore(e.target.value))
                }}
                placeholder="Enter your question title"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleRephraseTitle}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
                disabled={loadingTitle || !title.trim()}
              >
                {loadingTitle ? 'Rephrasing...' : 'Rephrase with AI'}
              </button>
            </div>
            {title && (
              <div className="mt-2 text-sm text-gray-500">
                Avoid vague titles like "Help me please"
              </div>
            )}
            {clarityScore !== null && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-medium">Clarity score:</span>
                <div className="flex items-center">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full mx-0.5 ${
                        i < clarityScore ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {clarityScore}/10 {clarityScore >= 7 ? '😊' : '🤔'}
                </span>
              </div>
            )}
            {aiTitle && (
              <div className="mt-2 bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>AI Suggestion:</strong> {aiTitle}
                </p>
                <button
                  type="button"
                  onClick={() => setTitle(aiTitle)}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  Use this version
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
                <button
                  type="button"
                  onClick={handleRephraseDescription}
                  className="text-sm text-blue-600 hover:text-blue-700"
                  disabled={loadingDescription || !description.trim()}
                >
                  {loadingDescription ? 'Rephrasing...' : 'Rephrase with AI'}
                </button>
              </div>
            </div>
            {showPreview ? (
              <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] bg-gray-50">
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe your question in detail..."
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Code Snippet */}
          <div>
            <button
              type="button"
              onClick={() => setShowCodeEditor(!showCodeEditor)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <FiCode />
              {showCodeEditor ? 'Hide Code Editor' : 'Add Code Snippet'}
            </button>
            {showCodeEditor && (
              <div className="mt-2">
                <textarea
                  value={codeSnippet}
                  onChange={e => setCodeSnippet(e.target.value)}
                  placeholder="Paste your code here..."
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Files
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={e => handleFiles(e.target.files)}
                className="hidden"
              />
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drag and drop files here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports: Images, PDFs, .txt, .docx
              </p>
            </div>
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={subject}
                onChange={e => {
                  setSubject(e.target.value)
                  if (e.target.value && !tags.includes(e.target.value)) {
                    addTag(e.target.value)
                  }
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select a subject</option>
                {SUBJECTS.map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              <div className="flex-1">
                <input
                  type="text"
                  value={customTag}
                  onChange={e => setCustomTag(e.target.value)}
                  placeholder="Add custom tag"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag(customTag)
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isPrivate
                  ? 'bg-gray-100 border-gray-300'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              {isPrivate ? (
                <>
                  <FiLock className="text-gray-600" />
                  <span className="text-sm text-gray-700">Private</span>
                </>
              ) : (
                <>
                  <FiGlobe className="text-blue-600" />
                  <span className="text-sm text-blue-700">Public</span>
                </>
              )}
            </button>
            <span className="text-sm text-gray-500">
              {isPrivate
                ? 'Only visible to tutors and moderators'
                : 'Visible to everyone'}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !title || !description || !subject}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white ${
              loading || !title || !description || !subject
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Question'}
          </button>

          {/* Anonymous Submission Checkbox */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
              Submit anonymously
            </label>
          </div>
        </form>
      </div>

      {/* Sidebar */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Tips for Better Questions
        </h2>
        <ul className="space-y-3 text-gray-600">
          <li>• Be specific about what you're trying to solve</li>
          <li>• Include relevant context and background</li>
          <li>• Show what you've tried so far</li>
          <li>• Format your code properly</li>
          <li>• Use appropriate tags to help others find your question</li>
        </ul>
      </div>
    </div>
  )
}

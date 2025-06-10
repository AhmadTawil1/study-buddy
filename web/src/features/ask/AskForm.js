'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import { rephraseQuestion } from '@/src/services/aiService'
import { requestService } from '@/src/services/requestService'
import { FiUpload, FiCode, FiLock, FiGlobe } from 'react-icons/fi'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadFiles } from '@/src/services/storageService'
import { questionService } from '@/src/services/questionService'
import calculateClarityScore from '@/src/utils/clarityScore'
import { addTag, removeTag } from '@/src/utils/tags'
import { handleFiles as handleFilesUtil, removeFile as removeFileUtil } from '@/src/utils/fileUtils'
import TitleInput from './components/TitleInput'
import DescriptionInput from './components/DescriptionInput'
import FileUpload from './components/FileUpload'
import TagInput from './components/TagInput'
import PrivacyToggle from './components/PrivacyToggle'

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
      setFiles(prev => handleFilesUtil(e.dataTransfer.files, prev))
    }
  }

  const handleFiles = (fileList) => {
    setFiles(prev => handleFilesUtil(fileList, prev))
  }

  const removeFile = (index) => {
    setFiles(prev => removeFileUtil(prev, index))
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

    if (!title || !description || !subject) {
      setError('Title, description, and subject are required.')
      setLoading(false)
      return
    }

    if (!user) {
      setError('You must be logged in to ask a question.')
      setLoading(false)
      return
    }

    let fileDownloadURLs = []
    try {
      if (files.length > 0) {
        console.log('Uploading files:', files)
        fileDownloadURLs = await uploadFiles(files, `users/${user.uid}/uploads`, (index, progress) => {
          console.log(`File ${files[index].name} progress: ${progress}%`)
          const fileName = files[index].name
          setFiles(prev => prev.map(file => 
            file.name === fileName ? { ...file, uploadProgress: progress } : file
          ))
        })
        console.log('File upload complete:', fileDownloadURLs)
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
        fileURLs: fileDownloadURLs,
        codeSnippet: codeSnippet || null,
        clarityScore: calculateClarityScore(title),
      }

      console.log('Creating request:', request)
      const createdRequest = await requestService.createRequest(request)
      console.log('Request created:', createdRequest)
      const questionId = createdRequest.id

      // Call the AI answer API
      const aiRes = await fetch('/api/ai-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: title + '\n' + description })
      })
      const { answer: aiAnswer } = await aiRes.json()
      console.log('AI answer:', aiAnswer)

      // Save the AI answer as a normal answer
      await questionService.addAnswer(questionId, {
        author: 'AI Assistant',
        badge: 'AI',
        content: aiAnswer,
        userId: 'ai-bot',
        requestId: questionId
      })
      console.log('AI answer saved')

      setSuccess(true)
      setTimeout(() => {
        router.push('/requests')
      }, 1200)
    } catch (err) {
      setError(`Submission failed: ${err.message || 'An unexpected error occurred. Please try again.'}`)
      console.error('Submission failed:', err)
    }
    setLoading(false)
  }

  const handleFileSelect = (file) => {
    if (file) {
      handleFiles([file]);
    }
  };

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
          <TitleInput
            value={title}
            onChange={val => {
              setTitle(val)
              setClarityScore(calculateClarityScore(val))
            }}
            onRephrase={handleRephraseTitle}
            loading={loadingTitle}
            clarityScore={clarityScore}
            maxLength={MAX_TITLE_LENGTH}
          />

          {/* Description Input */}
          <DescriptionInput
            value={description}
            onChange={setDescription}
            onRephrase={handleRephraseDescription}
            loading={loadingDescription}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
          />

          {/* File Upload */}
          <FileUpload
            files={files}
            setFiles={setFiles}
            dragActive={dragActive}
            setDragActive={setDragActive}
            onFilesAdd={handleFiles}
            onFileRemove={removeFile}
          />

          {/* Tag/Subject Input */}
          <TagInput
            subject={subject}
            setSubject={setSubject}
            tags={tags}
            setTags={setTags}
            customTag={customTag}
            setCustomTag={setCustomTag}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            subjectsList={SUBJECTS}
          />

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

          {/* Privacy/Anonymous Toggle */}
          <PrivacyToggle
            isPrivate={isPrivate}
            setIsPrivate={setIsPrivate}
            isAnonymous={isAnonymous}
            setIsAnonymous={setIsAnonymous}
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-md text-white font-medium ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Question'}
            </button>
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

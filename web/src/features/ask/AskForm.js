'use client'
import { useState, useRef, useEffect } from 'react'
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
import FileUpload from '@/src/components/common/FileUpload'
import TagInput from './components/TagInput'
import PrivacyToggle from './components/PrivacyToggle'
import Editor from '@monaco-editor/react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '@/src/context/themeContext'

const MAX_TITLE_LENGTH = 100
const SUBJECTS = ['Math', 'Physics', 'Computer Science', 'Chemistry', 'Biology', 'Other']
const CODE_LANGUAGES = [
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
  { id: 'python', name: 'Python' },
  { id: 'python3', name: 'Python3' },
  { id: 'c', name: 'C' },
  { id: 'csharp', name: 'C#' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'php', name: 'PHP' },
  { id: 'swift', name: 'Swift' },
  { id: 'kotlin', name: 'Kotlin' },
  { id: 'dart', name: 'Dart' },
  { id: 'go', name: 'Go' },
  { id: 'ruby', name: 'Ruby' },
  { id: 'scala', name: 'Scala' },
  { id: 'rust', name: 'Rust' },
  { id: 'racket', name: 'Racket' },
  { id: 'erlang', name: 'Erlang' },
  { id: 'elixir', name: 'Elixir' }
]

export default function AskForm() {
  const { colors, mode } = useTheme();
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [tags, setTags] = useState([])
  const [isPrivate, setIsPrivate] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [files, setFiles] = useState([])
  const [codeSnippet, setCodeSnippet] = useState('')
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
  const [codeLanguage, setCodeLanguage] = useState('plaintext')
  const [aiAnswer, setAiAnswer] = useState('')
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    if (showCodeEditor && codeSnippet === '') {
      const comment = getCommentPrefix(codeLanguage);
    }
  }, [showCodeEditor, codeLanguage]);

  const getCommentPrefix = (language) => {
    switch (language) {
      case 'python':
      case 'ruby':
      case 'racket': // Assuming Racket uses # for single-line comments
      case 'elixir': // Assuming Elixir uses # for single-line comments
        return '#';
      case 'html':
        return '<!--';
      case 'sql':
        return '--';
      default: // C++, Java, JavaScript, TypeScript, C#, PHP, Swift, Kotlin, Dart, Go, Rust, Erlang
        return '//';
    }
  };

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
        title_lowercase: title.toLowerCase(),
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
        body: JSON.stringify({
          question: title + '\n' + description,
          codeSnippet: codeSnippet,
          codeLanguage: codeLanguage
        })
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

      // Wait a moment to ensure the answer is saved before redirecting
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSuccess(true)
      router.push('/requests')
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

  const regenerateAISuggestion = async () => {
    setRegenerating(true)
    try {
      const aiRes = await fetch('/api/ai-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: title + '\n' + description,
          codeSnippet: codeSnippet,
          codeLanguage: codeLanguage
        })
      })
      const { answer: newAiAnswer } = await aiRes.json()
      setAiAnswer(newAiAnswer)
    } catch (err) {
      setError('Failed to regenerate AI suggestion.')
    }
    setRegenerating(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-xl shadow-lg p-8" style={{ background: colors.card, color: colors.text }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>Ask a Question</h1>
        <p className="mb-8" style={{ color: colors.inputPlaceholder }}>Be clear. Be specific. We'll help.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg"
                style={{ background: colors.successBg, color: colors.successText }}
              >
                ✅ Question submitted successfully!
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg"
                style={{ background: colors.errorBg, color: colors.errorText }}
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
              className="flex items-center gap-2 text-sm font-medium rounded px-4 py-2 mt-2 mb-2"
              style={{ background: colors.button, color: colors.buttonSecondaryText }}
            >
              <FiCode />
              {showCodeEditor ? 'Hide Code Editor' : 'Add Code Snippet'}
            </button>
            {showCodeEditor && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm" style={{ color: colors.text }}>Language:</label>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ background: colors.inputBg, color: colors.inputText, borderColor: colors.inputBorder }}
                  >
                    {CODE_LANGUAGES.map(lang => (
                      <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                  </select>
                </div>
                <div className="border rounded-lg overflow-hidden" style={{ height: '300px', background: colors.inputBg, borderColor: colors.inputBorder }}>
                  <Editor
                    height="100%"
                    defaultLanguage={codeLanguage}
                    language={codeLanguage}
                    value={codeSnippet}
                    onChange={setCodeSnippet}
                    theme={mode === 'dark' ? 'vs-dark' : 'vs-light'}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
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
              className="px-6 py-2 rounded-md font-medium transition-colors"
              style={{ background: colors.button, color: colors.buttonSecondaryText, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Submitting...' : 'Submit Question'}
            </button>
          </div>
        </form>

        {showAIAssistant && aiAnswer && (
          <div className="mt-8 border rounded-xl shadow p-6" style={{ background: colors.card, borderColor: colors.inputBorder, color: colors.text }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.text }}>AI Assistant Answer & Suggestions</h3>
            <div className="rounded-lg p-4 mb-4" style={{ background: colors.inputBg, color: colors.inputText }}>
              <SyntaxHighlighter language="markdown" style={oneDark} customStyle={{ borderRadius: '0.5rem', fontSize: 16 }}>
                {aiAnswer}
              </SyntaxHighlighter>
            </div>
            {codeSnippet && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2" style={{ color: colors.text }}>Code Snippet</h4>
                <SyntaxHighlighter language={codeLanguage || 'plaintext'} style={oneDark} customStyle={{ borderRadius: '0.5rem', fontSize: 15 }}>
                  {codeSnippet}
                </SyntaxHighlighter>
              </div>
            )}
            <div className="flex flex-row gap-4 mt-4">
              <button
                className="px-6 py-2 rounded-md font-medium transition-colors"
                style={{ background: colors.button, color: colors.buttonSecondaryText, opacity: regenerating ? 0.7 : 1 }}
                onClick={regenerateAISuggestion}
                disabled={regenerating}
              >
                {regenerating ? 'Regenerating...' : 'Regenerate AI Suggestion'}
              </button>
              <button
                className="px-6 py-2 rounded-md font-medium transition-colors"
                style={{ background: colors.inputBg, color: colors.text, border: `1px solid ${colors.inputBorder}` }}
                onClick={() => router.push('/requests')}
              >
                Go to Requests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

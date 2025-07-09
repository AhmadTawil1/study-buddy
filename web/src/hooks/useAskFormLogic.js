'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import { rephraseQuestion, generateAnswer } from '@/src/services/aiService'
import { requestService } from '@/src/services/requests/requestService'
import { uploadFiles } from '@/src/services/storageService'
import { questionService } from '@/src/services/questionService'
import calculateClarityScore from '@/src/utils/clarityScore'
import { handleFiles as handleFilesUtil, removeFile as removeFileUtil, updateFileProgress } from '@/src/utils/fileUtils'
import { MAX_TITLE_LENGTH } from '@/src/constants/askConfig'

export function useAskFormLogic() {
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
          setFiles(prev => updateFileProgress(prev, fileName, progress))
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
      const requestId = createdRequest.id

      // Generate AI answer using the service
      const aiAnswer = await generateAnswer({
        title,
        description,
        codeSnippet,
        codeLanguage
      })
      console.log('AI answer:', aiAnswer)

      // Save the AI answer as a normal answer
      await questionService.addAnswer(requestId, {
        author: 'AI Assistant',
        badge: 'AI',
        content: aiAnswer,
        userId: 'ai-bot',
        requestId: requestId
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

  const updateTitle = (val) => {
    setTitle(val)
    setClarityScore(calculateClarityScore(val))
  }

  return {
    // State
    title,
    description,
    subject,
    tags,
    isPrivate,
    isAnonymous,
    files,
    codeSnippet,
    showCodeEditor,
    customTag,
    clarityScore,
    aiTitle,
    loadingTitle,
    loadingDescription,
    loading,
    success,
    error,
    dragActive,
    codeLanguage,
    
    // Setters
    setTitle: updateTitle,
    setDescription,
    setSubject,
    setTags,
    setIsPrivate,
    setIsAnonymous,
    setFiles,
    setCodeSnippet,
    setShowCodeEditor,
    setCustomTag,
    setClarityScore,
    setAiTitle,
    setLoadingTitle,
    setLoadingDescription,
    setLoading,
    setSuccess,
    setError,
    setDragActive,
    setCodeLanguage,
    
    // Handlers
    handleSubmit,
    handleRephraseTitle,
    handleRephraseDescription,
    handleFiles,
    removeFile,
    addTag,
    removeTag,
    
    // Constants
    MAX_TITLE_LENGTH
  }
} 
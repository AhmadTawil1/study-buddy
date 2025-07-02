'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import { profileService } from '@/src/services/profileService'
import { requestService } from '@/src/services/requests/requestService'
import { buildRecentActivity, isProfileOwner } from '@/src/utils/profileUtils'
import { getAuth } from 'firebase/auth'

export function useProfileLogic(user, propUserId) {
  const { logout } = useAuth()
  const router = useRouter()

  // State
  const [profile, setProfile] = useState(null)
  const [myQuestions, setMyQuestions] = useState([])
  const [myAnswers, setMyAnswers] = useState([])
  const [savedQuestions, setSavedQuestions] = useState([])
  const [stats, setStats] = useState({
    questionsAsked: 0,
    questionsAnswered: 0,
    upvotesEarned: 0,
    averageRating: 0,
    rank: 0
  })
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [editingAbout, setEditingAbout] = useState(false)
  const [editAbout, setEditAbout] = useState('')
  const [savingAbout, setSavingAbout] = useState(false)
  const [editingSocial, setEditingSocial] = useState(false)
  const [editGithub, setEditGithub] = useState('')
  const [editLinkedin, setEditLinkedin] = useState('')
  const [savingSocial, setSavingSocial] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Determine which userId to use
  const userId = propUserId || (user ? user.uid : null)
  const isOwner = isProfileOwner(user, userId, propUserId)

  // Handlers
  const handleUnsave = async (questionId) => {
    if (!user) return
    try {
      await requestService.unsaveQuestion(user.uid, questionId)
      setSavedQuestions(prev => prev.filter(q => q.id !== questionId))
    } catch (error) {
      console.error('Error unsaving question:', error)
    }
  }

  const handleSaveName = async () => {
    if (!editName.trim()) return
    setSavingName(true)
    setSaveMsg('')
    try {
      await profileService.updateProfile(userId, { name: editName })
      setEditingName(false)
      setProfile(prev => ({ ...prev, name: editName }))
      // Reload Firebase Auth user so displayName is up to date
      const auth = getAuth();
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
      setSaveMsg('Name updated!')
    } catch (e) { 
      setSaveMsg('Failed to update name.') 
    }
    setSavingName(false)
    setTimeout(() => setSaveMsg(''), 2000)
  }

  const handleSaveAbout = async () => {
    setSavingAbout(true)
    setSaveMsg('')
    try {
      await profileService.updateProfile(userId, { about: editAbout })
      setEditingAbout(false)
      setProfile(prev => ({ ...prev, about: editAbout }))
      setSaveMsg('About updated!')
    } catch (e) { 
      setSaveMsg('Failed to update about.') 
    }
    setSavingAbout(false)
    setTimeout(() => setSaveMsg(''), 2000)
  }

  const handleSaveSocial = async () => {
    setSavingSocial(true)
    setSaveMsg('')
    try {
      await profileService.updateProfile(userId, { github: editGithub, linkedin: editLinkedin })
      setEditingSocial(false)
      setProfile(prev => ({ ...prev, github: editGithub, linkedin: editLinkedin }))
      setSaveMsg('Social links updated!')
    } catch (e) { 
      setSaveMsg('Failed to update social links.') 
    }
    setSavingSocial(false)
    setTimeout(() => setSaveMsg(''), 2000)
  }

  // Effects
  useEffect(() => {
    if (!userId) return
    const fetchData = async () => {
      const [profileData, questions, answers, saved] = await Promise.all([
        profileService.getUserProfile(userId),
        profileService.getUserQuestions(userId),
        profileService.getUserAnswers(userId, user ? user.email : null),
        requestService.getSavedQuestions(userId)
      ])
      setProfile(profileData)
      setMyQuestions(questions)
      setMyAnswers(answers)
      
      // Fetch details for saved questions
      const savedQuestionDetails = await Promise.all(
        saved.map(async (savedQ) => {
          const req = await requestService.getRequestById(savedQ.id)
          return req ? { ...req, savedAt: savedQ.savedAt } : null
        })
      )
      setSavedQuestions(savedQuestionDetails.filter(Boolean))
      
      const statsData = await profileService.getUserStats(userId, user ? user.email : null)
      setStats({
        ...statsData,
        questionsAsked: questions.length,
        questionsAnswered: answers.length
      })
    }
    fetchData()
  }, [userId, user])

  useEffect(() => {
    if (profile) {
      setEditName(profile.name || '')
      setEditAbout(profile.about || '') 
      setEditGithub(profile.github || '')
      setEditLinkedin(profile.linkedin || '')
    }
  }, [profile])

  // Computed values
  const recentActivity = buildRecentActivity(myQuestions, myAnswers, 6)

  return {
    // State
    profile,
    myQuestions,
    myAnswers,
    savedQuestions,
    stats,
    editingName,
    editName,
    savingName,
    editingAbout,
    editAbout,
    savingAbout,
    editingSocial,
    editGithub,
    editLinkedin,
    savingSocial,
    saveMsg,
    isOwner,
    userId,

    // Setters
    setEditingName,
    setEditName,
    setEditingAbout,
    setEditAbout,
    setEditingSocial,
    setEditGithub,
    setEditLinkedin,

    // Handlers
    handleUnsave,
    handleSaveName,
    handleSaveAbout,
    handleSaveSocial,
    logout,
    router,

    // Computed
    recentActivity
  }
} 
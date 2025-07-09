'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/src/context/authContext'
import { useTheme } from '@/src/context/themeContext'
import formatDate from '@/src/utils/formatDate'
import { 
  UserCircleIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { profileService } from '@/src/services/profileService'
import { useRouter } from 'next/navigation'
import Badge from '@/src/components/common/Badge'

export default function PublicProfileView({ userId }) {
  const { user } = useAuth()
  const { colors, mode } = useTheme()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    questionsAsked: 0,
    questionsAnswered: 0,
    upvotesEarned: 0,
    rank: 0
  })
  const router = useRouter()

  useEffect(() => {
    if (!userId) return
    const fetchData = async () => {
      const [profileData, questions, answers] = await Promise.all([
        profileService.getPublicUserProfile(userId),
        profileService.getUserQuestions(userId),
        profileService.getUserAnswers(userId, user ? user.email : null)
      ])
      setProfile(profileData)
      
      const statsData = await profileService.getUserStats(userId, user ? user.email : null)
      setStats({
        ...statsData,
        questionsAsked: questions.length,
        questionsAnswered: answers.length
      })
    }
    fetchData()
  }, [userId, user])

  if (!profile) return <p style={{ color: colors.text }}>Loading...</p>

  const isPrivate = profile.profileVisibility === 'private' && user?.uid !== userId

  if (isPrivate) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-lg shadow-lg p-8 mt-8" style={{ background: colors.card }}>
          <LockClosedIcon className="w-12 h-12 mb-4" style={{ color: colors.inputPlaceholder }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>This profile is private.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div className="p-4 rounded-lg text-center shadow-sm" style={{ background: mode === 'dark' ? '#1e293b' : '#ecfdf5' }}>
              <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto mb-2" style={{ color: mode === 'dark' ? '#4ade80' : '#059669' }} />
              <div className="text-2xl font-bold" style={{ color: mode === 'dark' ? '#4ade80' : '#059669' }}>{stats.questionsAnswered}</div>
              <div className="text-sm" style={{ color: mode === 'dark' ? '#4ade80' : '#059669' }}>Questions Answered</div>
            </div>
            <div className="p-4 rounded-lg text-center shadow-sm" style={{ background: mode === 'dark' ? '#1e293b' : '#fffbeb' }}>
              <TrophyIcon className="w-8 h-8 mx-auto mb-2" style={{ color: mode === 'dark' ? '#fbbf24' : '#d97706' }} />
              <div className="text-2xl font-bold" style={{ color: mode === 'dark' ? '#fbbf24' : '#d97706' }}>{stats.upvotesEarned}</div>
              <div className="text-sm" style={{ color: mode === 'dark' ? '#fbbf24' : '#d97706' }}>Upvotes Earned</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: colors.page }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User Banner */}
        <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg">
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-end">
            <div className="relative flex-shrink-0 mb-4 sm:mb-0">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <UserCircleIcon className="w-24 h-24 sm:w-32 sm:h-32 text-white" />
              )}
            </div>
            <div className="text-white ml-4">
              <h2 className="text-2xl sm:text-3xl font-bold">{profile.name}</h2>
              <p className="text-sm opacity-90">{profile.email}</p>
              {profile.joinDate && (
                <p className="text-sm opacity-80">Joined: {formatDate(profile.joinDate?.toDate ? profile.joinDate.toDate() : profile.joinDate)}</p>
              )}
            </div>
          </div>
        </div>
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {stats.badges && stats.badges.map(badgeKey => (
            <Badge key={badgeKey} badgeKey={badgeKey} />
          ))}
        </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-8">
          <div className="p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow" style={{ background: mode === 'dark' ? '#1e293b' : '#eef2ff' }}>
            <QuestionMarkCircleIcon className="w-8 h-8 mx-auto mb-2" style={{ color: mode === 'dark' ? '#818cf8' : '#4f46e5' }} />
            <div className="text-2xl font-bold" style={{ color: mode === 'dark' ? '#818cf8' : '#4f46e5' }}>{stats.questionsAsked}</div>
            <div className="text-sm" style={{ color: mode === 'dark' ? '#818cf8' : '#4f46e5' }}>Questions Asked</div>
          </div>
          <div className="p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow" style={{ background: mode === 'dark' ? '#1e293b' : '#ecfdf5' }}>
            <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto mb-2" style={{ color: mode === 'dark' ? '#4ade80' : '#059669' }} />
            <div className="text-2xl font-bold" style={{ color: mode === 'dark' ? '#4ade80' : '#059669' }}>{stats.questionsAnswered}</div>
            <div className="text-sm" style={{ color: mode === 'dark' ? '#4ade80' : '#059669' }}>Questions Answered</div>
          </div>
          <div className="p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow" style={{ background: mode === 'dark' ? '#1e293b' : '#fffbeb' }}>
            <TrophyIcon className="w-8 h-8 mx-auto mb-2" style={{ color: mode === 'dark' ? '#fbbf24' : '#d97706' }} />
            <div className="text-2xl font-bold" style={{ color: mode === 'dark' ? '#fbbf24' : '#d97706' }}>{stats.upvotesEarned}</div>
            <div className="text-sm" style={{ color: mode === 'dark' ? '#fbbf24' : '#d97706' }}>Upvotes Earned</div>
          </div>
          <div className="p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow" style={{ background: mode === 'dark' ? '#1e293b' : '#f5f3ff' }}>
            <TrophyIcon className="w-8 h-8 mx-auto mb-2" style={{ color: mode === 'dark' ? '#a78bfa' : '#7c3aed' }} />
            <div className="text-2xl font-bold" style={{ color: mode === 'dark' ? '#a78bfa' : '#7c3aed' }}>{stats.points}</div>
            <div className="text-sm" style={{ color: mode === 'dark' ? '#a78bfa' : '#7c3aed' }}>Points</div>
          </div>
          <div className="p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow" style={{ background: mode === 'dark' ? '#1e293b' : '#fef2f2' }}>
            <TrophyIcon className="w-8 h-8 mx-auto mb-2" style={{ color: mode === 'dark' ? '#fb7185' : '#e11d48' }} />
            <div className="text-2xl font-bold" style={{ color: mode === 'dark' ? '#fb7185' : '#e11d48' }}>#{stats.rank}</div>
            <div className="text-sm" style={{ color: mode === 'dark' ? '#fb7185' : '#e11d48' }}>Rank</div>
          </div>
        </div>
      </div>
    </div>
  )
} 
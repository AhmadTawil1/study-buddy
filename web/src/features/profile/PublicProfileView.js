'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/src/context/authContext'
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

export default function PublicProfileView({ userId }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    questionsAsked: 0,
    questionsAnswered: 0,
    upvotesEarned: 0,
    averageRating: 0,
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

  if (!profile) return <p>Loading...</p>

  const isPrivate = profile.profileVisibility === 'private' && user?.uid !== userId

  if (isPrivate) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-8 mt-8">
          <LockClosedIcon className="w-12 h-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">This profile is private.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div className="bg-emerald-50 p-4 rounded-lg text-center shadow-sm">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-700">{stats.questionsAnswered}</div>
              <div className="text-sm text-emerald-600">Questions Answered</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg text-center shadow-sm">
              <TrophyIcon className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-700">{stats.upvotesEarned}</div>
              <div className="text-sm text-amber-600">Upvotes Earned</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8 mt-8">
          <div className="bg-indigo-50 p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
            <QuestionMarkCircleIcon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-indigo-700">{stats.questionsAsked}</div>
            <div className="text-sm text-indigo-600">Questions Asked</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-700">{stats.questionsAnswered}</div>
            <div className="text-sm text-emerald-600">Questions Answered</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
            <TrophyIcon className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-amber-700">{stats.upvotesEarned}</div>
            <div className="text-sm text-amber-600">Upvotes Earned</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
            <TrophyIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{stats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-purple-600">Avg. Rating</div>
          </div>
          <div className="bg-rose-50 p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
            <TrophyIcon className="w-8 h-8 text-rose-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-rose-700">#{stats.rank}</div>
            <div className="text-sm text-rose-600">Rank</div>
          </div>
        </div>
      </div>
    </div>
  )
} 
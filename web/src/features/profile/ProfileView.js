// src/features/profile/ProfileView.js
'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/src/context/authContext'
import formatDate from '@/src/utils/formatDate'
import { Tab } from '@headlessui/react'
import { 
  UserCircleIcon, 
  PencilIcon, 
  TrophyIcon, 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  BookmarkIcon,
  BellIcon,
  LinkIcon,
  AcademicCapIcon,
  ShieldExclamationIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
  ClockIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/outline'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'
import { profileService } from '@/src/services/profileService'

export default function ProfileView() {
  const { user, logout } = useAuth()
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

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const [profileData, questions, answers, saved] = await Promise.all([
        profileService.getUserProfile(user.uid),
        profileService.getUserQuestions(user.uid),
        profileService.getUserAnswers(user.uid, user.email),
        profileService.getUserSavedQuestions(user.uid)
      ])
      setProfile(profileData)
      setMyQuestions(questions)
      setMyAnswers(answers)
      setSavedQuestions(saved)
      const statsData = await profileService.getUserStats(user.uid, user.email)
      setStats({
        ...statsData,
        questionsAsked: questions.length,
        questionsAnswered: answers.length
      })
    }
    fetchData()
  }, [user])

  // Build recentActivity dynamically from fetched data
  const recentActivity = [
    ...myQuestions.map(q => ({
      type: 'asked',
      description: `Asked: ${q.title}`,
      time: q.createdAt,
    })),
    ...myAnswers.map(a => ({
      type: 'answered',
      description: `Answered: ${a.questionTitle || a.content?.substring(0, 50) + '...'}`,
      time: a.createdAt,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  if (!user || !profile) return <p>Loading...</p>

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* User Banner */}
      <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-purple-600">
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
            <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <PencilIcon className="w-5 h-5 text-indigo-600" />
            </button>
          </div>
          <div className="sm:ml-6 text-white text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold">{profile.name}</h2>
            <p className="text-sm opacity-90">{profile.email}</p>
            <p className="text-sm opacity-80">Joined: {formatDate(profile.joinDate?.toDate())}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-indigo-50 p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
            <QuestionMarkCircleIcon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-indigo-700">{stats.questionsAsked}</div>
            <div className="text-sm text-indigo-600">Questions Asked</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-700">{stats.questionsAnswered}</div>
            <div className="text-sm text-emerald-600">Questions Answered</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
            <TrophyIcon className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-amber-700">{stats.upvotesEarned}</div>
            <div className="text-sm text-amber-600">Upvotes Earned</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
            <TrophyIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{stats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-purple-600">Avg. Rating</div>
          </div>
          <div className="bg-rose-50 p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
            <TrophyIcon className="w-8 h-8 text-rose-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-rose-700">#{stats.rank}</div>
            <div className="text-sm text-rose-600">Rank</div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-indigo-600" /> Recent Activity
          </h3>
          <ol className="relative border-l border-gray-200 ml-4">
            {recentActivity.length === 0 ? (
              <li className="text-gray-500 ml-4">No recent activity.</li>
            ) : (
              recentActivity.map((activity, idx) => (
                <li key={idx} className="mb-6 ml-6">
                  <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-8 ring-white ${
                    activity.type === 'answered' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}>
                    {activity.type === 'answered' ? (
                      <ChatBubbleLeftRightIcon className="w-4 h-4 text-white" />
                    ) : (
                      <QuestionMarkCircleIcon className="w-4 h-4 text-white" />
                    )}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{activity.description}</span>
                    <span className="text-xs text-gray-500">
                      {activity.time && !isNaN(new Date(activity.time))
                        ? formatDistanceToNow(new Date(activity.time), { addSuffix: true })
                        : ''}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ol>
        </div>

        {/* Tabs */}
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-indigo-50 p-1">
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
              ${selected 
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-indigo-600 hover:bg-white/50'
              }`
            }>
              My Questions
            </Tab>
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
              ${selected 
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-emerald-600 hover:bg-white/50'
              }`
            }>
              My Answers
            </Tab>
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
              ${selected 
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-purple-600 hover:bg-white/50'
              }`
            }>
              Saved Questions
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-4">
            <Tab.Panel>
              <div className="space-y-4">
                {myQuestions.length === 0 ? (
                  <p className="text-gray-500">No questions asked yet.</p>
                ) : (
                  myQuestions.map(q => (
                    <div key={q.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100">
                        <QuestionMarkCircleIcon className="w-5 h-5 text-indigo-600" />
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Asked: {q.title}</div>
                        <div className="text-xs text-gray-500">
                          {q.createdAt && !isNaN(new Date(q.createdAt))
                            ? formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })
                            : ''}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="space-y-4">
                {myAnswers.length === 0 ? (
                  <p className="text-gray-500">No answers provided yet.</p>
                ) : (
                  myAnswers.map(a => (
                    <div key={a.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-600" />
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Answered: {a.questionTitle}</div>
                        <div className="text-xs text-gray-500">
                          {a.createdAt && !isNaN(new Date(a.createdAt))
                            ? formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })
                            : ''}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="space-y-4">
                {savedQuestions.length === 0 ? (
                  <p className="text-gray-500">No saved questions yet.</p>
                ) : (
                  savedQuestions.map(q => (
                    <div key={q.id} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <h3 className="font-medium text-gray-900">{q.title}</h3>
                      <p className="text-sm text-gray-600">{q.description}</p>
                    </div>
                  ))
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {/* Account Management */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Management</h3>
          <div className="space-y-4">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors">
              <BellIcon className="w-5 h-5" />
              <span>Notification Preferences</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors">
              <ShieldExclamationIcon className="w-5 h-5" />
              <span>Change Password</span>
            </button>
            <button 
              onClick={logout}
              className="flex items-center space-x-2 text-gray-700 hover:text-rose-600 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
            <div className="pt-4 border-t border-gray-200">
              <button className="flex items-center space-x-2 text-rose-600 hover:text-rose-700 transition-colors">
                <TrashIcon className="w-5 h-5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Social/Academic Links */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Social / Academic Links</h3>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                <FaGithub className="w-5 h-5" />
                <span>Link GitHub</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm">
                <FaLinkedin className="w-5 h-5" />
                <span>Link LinkedIn</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input 
                  type="text" 
                  placeholder="Enter your student ID" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <input 
                  type="text" 
                  placeholder="Enter your university" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

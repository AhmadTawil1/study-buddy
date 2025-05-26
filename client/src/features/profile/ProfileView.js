// src/features/profile/ProfileView.js
'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/src/context/authContext'
import { db } from '@/src/firebase/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
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
  ClockIcon
} from '@heroicons/react/24/outline'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'

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
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      
      // Fetch questions
      const questionsQuery = query(collection(db, 'requests'), where('userId', '==', user.uid))
      const questionsSnap = await getDocs(questionsQuery)
      
      // Fetch answers
      const answersQuery = query(collection(db, 'answers'), where('userId', '==', user.uid))
      const answersSnap = await getDocs(answersQuery)
      
      // Fetch saved questions
      const savedQuery = query(collection(db, 'savedQuestions'), where('userId', '==', user.uid))
      const savedSnap = await getDocs(savedQuery)

      setProfile(userSnap.data())
      setMyQuestions(questionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setMyAnswers(answersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setSavedQuestions(savedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      
      // Calculate stats
      setStats({
        questionsAsked: questionsSnap.size,
        questionsAnswered: answersSnap.size,
        upvotesEarned: answersSnap.docs.reduce((acc, doc) => acc + (doc.data().upvotes || 0), 0),
        averageRating: profile?.averageRating || 0,
        rank: profile?.rank || 0
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
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <div className="relative">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-32 h-32 rounded-full border-4 border-white"
              />
            ) : (
              <UserCircleIcon className="w-32 h-32 text-white" />
            )}
            <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100">
              <PencilIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="ml-6 text-white">
            <h2 className="text-3xl font-bold">{profile.name}</h2>
            <p className="text-sm opacity-90">{profile.email}</p>
            <p className="text-sm opacity-80">Joined: {formatDate(profile.joinDate?.toDate())}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <QuestionMarkCircleIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{stats.questionsAsked}</div>
            <div className="text-sm text-gray-600">Questions Asked</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">{stats.questionsAnswered}</div>
            <div className="text-sm text-gray-600">Questions Answered</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <TrophyIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-700">{stats.upvotesEarned}</div>
            <div className="text-sm text-gray-600">Upvotes Earned</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <TrophyIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{stats.averageRating}</div>
            <div className="text-sm text-gray-600">Avg. Rating</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <TrophyIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700">#{stats.rank}</div>
            <div className="text-sm text-gray-600">Rank</div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-500" /> Recent Activity
          </h3>
          <ol className="relative border-l border-gray-200 ml-4">
            {recentActivity.length === 0 ? (
              <li className="text-gray-500 ml-4">No recent activity.</li>
            ) : (
              recentActivity.map((activity, idx) => (
                <li key={idx} className="mb-6 ml-6">
                  <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-8 ring-white ${activity.type === 'answered' ? 'bg-green-400' : 'bg-blue-400'}`}>
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
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected 
                ? 'bg-blue-100 text-blue-700 shadow'
                : 'text-blue-700 hover:bg-blue-50'
              }`
            }>
              My Questions
            </Tab>
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected 
                ? 'bg-green-100 text-green-700 shadow'
                : 'text-green-700 hover:bg-green-50'
              }`
            }>
              My Answers
            </Tab>
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected 
                ? 'bg-purple-100 text-purple-700 shadow'
                : 'text-purple-700 hover:bg-purple-50'
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
                    <div key={q.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-400">
                        <QuestionMarkCircleIcon className="w-5 h-5 text-white" />
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">Asked: {q.title}</div>
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
                    <div key={a.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-400">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">Answered: {a.questionTitle}</div>
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
                    <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium">{q.title}</h3>
                      <p className="text-sm text-gray-600">{q.description}</p>
                    </div>
                  ))
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {/* Account Management */}
        <div className="mt-8 border-t pt-8">
          <h3 className="text-xl font-semibold mb-4">Account Management</h3>
          <div className="space-y-4">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
              <BellIcon className="w-5 h-5" />
              <span>Notification Preferences</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
              <ShieldExclamationIcon className="w-5 h-5" />
              <span>Change Password</span>
            </button>
            <button 
              onClick={logout}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
            <div className="pt-4 border-t border-red-200">
              <button className="flex items-center space-x-2 text-red-600 hover:text-red-700">
                <TrashIcon className="w-5 h-5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Social/Academic Links */}
        <div className="mt-8 border-t pt-8">
          <h3 className="text-xl font-semibold mb-4">Social / Academic Links</h3>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">
                <FaGithub className="w-5 h-5" />
                <span>Link GitHub</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
                <FaLinkedin className="w-5 h-5" />
                <span>Link LinkedIn</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input type="text" placeholder="Enter your student ID" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <input type="text" placeholder="Enter your university" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
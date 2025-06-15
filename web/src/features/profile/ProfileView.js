// src/features/profile/ProfileView.js
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Tab } from '@headlessui/react'
import { 
  UserCircleIcon, 
  PencilIcon, 
  TrophyIcon, 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ShieldExclamationIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { FaGithub, FaLinkedin, FaUserEdit } from 'react-icons/fa'

// Context and Services
import { useAuth } from '@/src/context/authContext'
import { useTheme } from '@/src/context/themeContext'
import { profileService } from '@/src/services/profileService'
import { requestService } from '@/src/services/requestService'

// Utils
import formatDate from '@/src/utils/formatDate'

export default function ProfileView({ userId: propUserId }) {
  const { user, logout } = useAuth()
  const { colors, mode } = useTheme()
  const router = useRouter()

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
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [editAbout, setEditAbout] = useState('');
  const [savingAbout, setSavingAbout] = useState(false);
  const [editingSocial, setEditingSocial] = useState(false);
  const [editGithub, setEditGithub] = useState(profile?.github || '');
  const [editLinkedin, setEditLinkedin] = useState(profile?.linkedin || '');
  const [savingSocial, setSavingSocial] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Determine which userId to use
  const userId = propUserId || (user ? user.uid : null)
  const isOwner = user && userId === user.uid

  const handleUnsave = async (questionId) => {
    if (!user) return
    try {
      await requestService.unsaveQuestion(user.uid, questionId)
      setSavedQuestions(prev => prev.filter(q => q.id !== questionId))
    } catch (error) {
      console.error('Error unsaving question:', error)
    }
  }

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
          const req = await requestService.getRequestById(savedQ.id);
          return req ? { ...req, savedAt: savedQ.savedAt } : null;
        })
      );
      setSavedQuestions(savedQuestionDetails.filter(Boolean));
      
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
      setEditName(profile.name || '');
      setEditAbout(profile.about || ''); 
      setEditGithub(profile.github || '');
      setEditLinkedin(profile.linkedin || '');
    }
  }, [profile]);

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSavingName(true);
    setSaveMsg('');
    try {
      await profileService.updateProfile(userId, { name: editName });
      setEditingName(false);
      setProfile(prev => ({ ...prev, name: editName }));
      setSaveMsg('Name updated!');
    } catch (e) { setSaveMsg('Failed to update name.'); }
    setSavingName(false);
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const handleSaveAbout = async () => {
    setSavingAbout(true);
    setSaveMsg('');
    try {
      await profileService.updateProfile(userId, { about: editAbout });
      setEditingAbout(false);
      setProfile(prev => ({ ...prev, about: editAbout }));
      setSaveMsg('About updated!');
    } catch (e) { setSaveMsg('Failed to update about.'); }
    setSavingAbout(false);
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const handleSaveSocial = async () => {
    setSavingSocial(true);
    setSaveMsg('');
    try {
      await profileService.updateProfile(userId, { github: editGithub, linkedin: editLinkedin });
      setEditingSocial(false);
      setProfile(prev => ({ ...prev, github: editGithub, linkedin: editLinkedin }));
      setSaveMsg('Social links updated!');
    } catch (e) { setSaveMsg('Failed to update social links.'); }
    setSavingSocial(false);
    setTimeout(() => setSaveMsg(''), 2000);
  };

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
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  .slice(0, 6); // Only show the 6 most recent activities

  if (!user || !profile) return <p>Loading...</p>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
          <div className="text-white ml-4">
            {isOwner && editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="text-2xl sm:text-3xl font-bold rounded px-2 py-1 border focus:border-blue-500 outline-none"
                  style={{ color: colors.text, borderColor: colors.inputBorder }}
                />
                <button onClick={handleSaveName} disabled={savingName} className="px-2 py-1 rounded bg-blue-600 text-white text-sm font-semibold">Save</button>
                <button onClick={() => { setEditingName(false); setEditName(profile.name || ''); }} className="px-2 py-1 rounded text-sm" style={{ color: colors.inputPlaceholder }}>Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold">{profile.name}</h2>
                {isOwner && (
                  <button onClick={() => setEditingName(true)} className="text-sm underline" style={{ color: colors.button }}>Edit</button>
                )}
              </div>
            )}
            <p className="text-sm opacity-90">{profile.email}</p>
            {profile.joinDate && (
              <p className="text-sm opacity-80">Joined: {formatDate(profile.joinDate?.toDate ? profile.joinDate.toDate() : profile.joinDate)}</p>
            )}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-2xl mx-auto mt-8 mb-8 p-6 rounded-xl shadow-lg flex flex-col gap-4" style={{ background: colors.card, color: colors.text }}>
        <div className="flex items-center gap-3 mb-2">
          <FaUserEdit className="w-6 h-6" style={{ color: colors.button }} />
          <h3 className="text-lg font-semibold" style={{ color: colors.button }}>About</h3>
          {isOwner && !editingAbout && (
            <button onClick={() => setEditingAbout(true)} className="ml-auto px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1">
              <FaUserEdit className="w-4 h-4" /> Edit
            </button>
          )}
        </div>
        {isOwner && editingAbout ? (
          <div>
            <textarea
              className="w-full rounded border px-2 py-2 mb-2 text-base"
              rows={4}
              value={editAbout}
              onChange={e => setEditAbout(e.target.value)}
              style={{ color: colors.text, background: colors.inputBg, borderColor: colors.inputBorder }}
              disabled={savingAbout}
            />
            <div className="flex gap-2">
              <button onClick={handleSaveAbout} disabled={savingAbout} className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold">{savingAbout ? 'Saving...' : 'Save'}</button>
              <button onClick={() => { setEditingAbout(false); setEditAbout(profile.about || ''); }} className="px-4 py-2 rounded text-sm" style={{ color: colors.inputPlaceholder }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="text-lg leading-relaxed" style={{ color: colors.text, minHeight: 40 }}>
            {profile.about || (isOwner ? <span className="italic text-gray-400">Add a short description about yourself.</span> : <span className="italic text-gray-400">No description provided.</span>)}
          </div>
        )}
        {saveMsg && <div className="text-xs mt-1" style={{ color: saveMsg.includes('Failed') ? colors.error : colors.button }}>{saveMsg}</div>}
      </div>

      {/* Social Links Section */}
      <div className="max-w-2xl mx-auto mb-8 p-6 rounded-xl shadow-lg flex flex-col gap-4" style={{ background: colors.card, color: colors.text }}>
        <div className="flex items-center gap-3 mb-2">
          <FaGithub className="w-5 h-5" style={{ color: '#333' }} />
          <FaLinkedin className="w-5 h-5" style={{ color: '#0077b5' }} />
          <h3 className="text-lg font-semibold" style={{ color: colors.button }}>Social Accounts</h3>
          {isOwner && !editingSocial && (
            <button onClick={() => setEditingSocial(true)} className="ml-auto px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition">Edit</button>
          )}
        </div>
        {isOwner && editingSocial ? (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">GitHub URL</label>
              <input
                type="url"
                className="w-full rounded border px-2 py-2"
                value={editGithub}
                onChange={e => setEditGithub(e.target.value)}
                placeholder="https://github.com/yourusername"
                style={{ color: colors.text, background: colors.inputBg, borderColor: colors.inputBorder }}
                disabled={savingSocial}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
              <input
                type="url"
                className="w-full rounded border px-2 py-2"
                value={editLinkedin}
                onChange={e => setEditLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/yourusername"
                style={{ color: colors.text, background: colors.inputBg, borderColor: colors.inputBorder }}
                disabled={savingSocial}
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={handleSaveSocial} disabled={savingSocial} className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold">{savingSocial ? 'Saving...' : 'Save'}</button>
              <button onClick={() => { setEditingSocial(false); setEditGithub(profile.github || ''); setEditLinkedin(profile.linkedin || ''); }} className="px-4 py-2 rounded text-sm" style={{ color: colors.inputPlaceholder }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <FaGithub className="w-5 h-5" style={{ color: '#333' }} />
              {profile.github ? (
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">{profile.github}</a>
              ) : (
                <span className="text-gray-400">Not linked</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <FaLinkedin className="w-5 h-5" style={{ color: '#0077b5' }} />
              {profile.linkedin ? (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">{profile.linkedin}</a>
              ) : (
                <span className="text-gray-400">Not linked</span>
              )}
            </div>
          </div>
        )}
        {saveMsg && <div className="text-xs mt-1" style={{ color: saveMsg.includes('Failed') ? colors.error : colors.button }}>{saveMsg}</div>}
      </div>

      {/* Main Content */}
      <div className="mt-8">
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
        <div className="mb-12 px-4">
          <h3 className="font-semibold mb-6 flex items-center text-lg" style={{ color: mode === 'dark' ? '#E5E7EB' : colors.button }}>
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" style={{ color: mode === 'dark' ? '#3b82f6' : colors.button }} /> Recent Activity
          </h3>
          <ol className="relative border-l ml-4" style={{ borderColor: colors.inputBorder }}>
            {recentActivity.length === 0 ? (
              <li className="ml-4" style={{ color: mode === 'dark' ? '#E5E7EB' : colors.inputPlaceholder }}>No recent activity.</li>
            ) : (
              recentActivity.map((activity, idx) => (
                <li key={idx} className="mb-8 ml-6">
                  <span className="absolute -left-3 flex items-center justify-center w-7 h-7 rounded-full ring-8" style={{ ringColor: colors.card, background: activity.type === 'answered' ? '#22c55e' : '#3b82f6' }}>
                    {activity.type === 'answered' ? (
                      <ChatBubbleLeftRightIcon className="w-4 h-4" style={{ color: '#fff' }} />
                    ) : (
                      <QuestionMarkCircleIcon className="w-4 h-4" style={{ color: '#fff' }} />
                    )}
                  </span>
                  <div className="flex flex-col bg-opacity-80 rounded-lg p-4 shadow-sm" style={{ background: colors.inputBg }}>
                    <span className="font-medium mb-1" style={{ color: mode === 'dark' ? '#fff' : colors.text }}>
                      {activity.description}
                    </span>
                    <span className="text-xs" style={{ color: mode === 'dark' ? '#E5E7EB' : colors.inputPlaceholder }}>
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
        <div className="rounded-2xl shadow-xl p-4 mb-8" style={{ background: mode === 'dark' ? '#181a20' : colors.card }}>
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl p-1" style={{ background: mode === 'dark' ? '#23272f' : '#e0e7ef' }}>
              <Tab className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ` +
                (selected
                  ? 'bg-gray-900 text-white border-b-2 border-blue-400 shadow-sm'
                  : 'text-blue-400 hover:text-blue-200')
              }>
                My Questions
              </Tab>
              <Tab className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ` +
                (selected
                  ? 'bg-gray-900 text-white border-b-2 border-green-400 shadow-sm'
                  : 'text-green-400 hover:text-green-200')
              }>
                My Answers
              </Tab>
              <Tab className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ` +
                (selected
                  ? 'bg-gray-900 text-white border-b-2 border-purple-400 shadow-sm'
                  : 'text-purple-400 hover:text-purple-200')
              }>
                Saved Questions
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel
                className="rounded-xl p-3 mt-2"
                style={{ background: mode === 'dark' ? '#23272f' : '#fff', color: mode === 'dark' ? '#F3F4F6' : colors.text }}
              >
                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <ul className="space-y-4">
                    {myQuestions.length === 0 ? (
                      <li style={{ color: mode === 'dark' ? '#A1A1AA' : '#6B7280' }}>No questions asked yet.</li>
                    ) : (
                      myQuestions.map((q) => (
                        <li
                          key={q.id}
                          onClick={() => router.push(`/requests/${q.id}`)}
                          className="relative rounded-md p-3 hover:bg-gray-800/60 cursor-pointer transition-colors"
                          style={{ background: mode === 'dark' ? '#181a20' : '#f3f4f6' }}
                        >
                          <h3 className="text-sm font-medium leading-5" style={{ color: mode === 'dark' ? '#fff' : '#111827' }}>
                            {q.title}
                          </h3>
                          <ul className="mt-1 flex space-x-1 text-xs font-normal leading-4" style={{ color: mode === 'dark' ? '#A1A1AA' : '#6B7280' }}>
                            <li>{q.subject}</li>
                            <li>&middot;</li>
                            <li>{formatDate(q.createdAt?.toDate())}</li>
                          </ul>
                          <span className={'absolute inset-0 rounded-md'} />
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </Tab.Panel>
              <Tab.Panel
                className="rounded-xl p-3 mt-2"
                style={{ background: mode === 'dark' ? '#23272f' : '#fff', color: mode === 'dark' ? '#F3F4F6' : colors.text }}
              >
                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <ul className="space-y-4">
                    {myAnswers.length === 0 ? (
                      <li style={{ color: mode === 'dark' ? '#A1A1AA' : '#6B7280' }}>No answers provided yet.</li>
                    ) : (
                      myAnswers.map((a) => (
                        <li
                          key={a.id}
                          onClick={() => router.push(`/requests/${a.requestId}`)}
                          className="relative rounded-md p-3 hover:bg-gray-800/60 cursor-pointer transition-colors"
                          style={{ background: mode === 'dark' ? '#181a20' : '#f3f4f6' }}
                        >
                          <h3 className="text-sm font-medium leading-5" style={{ color: mode === 'dark' ? '#fff' : '#111827' }}>
                            {a.questionTitle || a.content?.substring(0, 50) + '...'}
                          </h3>
                          <ul className="mt-1 flex space-x-1 text-xs font-normal leading-4" style={{ color: mode === 'dark' ? '#A1A1AA' : '#6B7280' }}>
                            <li>Answered on {formatDate(a.createdAt?.toDate())}</li>
                          </ul>
                          <span className={'absolute inset-0 rounded-md'} />
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </Tab.Panel>
              <Tab.Panel
                className="rounded-xl p-3 mt-2"
                style={{ background: mode === 'dark' ? '#23272f' : '#fff', color: mode === 'dark' ? '#F3F4F6' : colors.text }}
              >
                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <ul className="space-y-4">
                    {savedQuestions.length === 0 ? (
                      <li style={{ color: mode === 'dark' ? '#A1A1AA' : '#6B7280' }}>No saved questions yet.</li>
                    ) : (
                      savedQuestions.map((q) => (
                        <li
                          key={q.id}
                          onClick={() => router.push(`/requests/${q.id}`)}
                          className="relative rounded-md p-3 hover:bg-gray-800/60 cursor-pointer transition-colors"
                          style={{ background: mode === 'dark' ? '#181a20' : '#f3f4f6' }}
                        >
                          <h3 className="text-sm font-medium leading-5" style={{ color: mode === 'dark' ? '#fff' : '#111827' }}>
                            {q.title}
                          </h3>
                          <ul className="mt-1 flex space-x-1 text-xs font-normal leading-4" style={{ color: mode === 'dark' ? '#A1A1AA' : '#6B7280' }}>
                            <li>{q.subject}</li>
                            <li>&middot;</li>
                            <li>Saved on {formatDate(q.savedAt?.toDate())}</li>
                          </ul>
                          <span className={'absolute inset-0 rounded-md'} />
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* Account Management */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Account Management</h3>
          <div className="space-y-4">
            <button className="flex items-center space-x-2 transition-colors" style={{ color: colors.text }}>
              <BellIcon className="w-5 h-5" style={{ color: colors.inputPlaceholder }} />
              <span>Notification Preferences</span>
            </button>
            <button className="flex items-center space-x-2 transition-colors" style={{ color: colors.text }}>
              <ShieldExclamationIcon className="w-5 h-5" style={{ color: colors.inputPlaceholder }} />
              <span>Change Password</span>
            </button>
            <button 
              onClick={logout}
              className="flex items-center space-x-2 transition-colors"
              style={{ color: colors.button }}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" style={{ color: colors.button }} />
              <span>Logout</span>
            </button>
            <div className="pt-4 border-t" style={{ borderColor: colors.inputBorder }}>
              <button className="flex items-center space-x-2 transition-colors font-semibold" style={{ color: colors.error }}>
                <TrashIcon className="w-5 h-5" style={{ color: colors.error }} />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Social/Academic Links */}
        {/* Social Links Section */}
        <div className="max-w-2xl mx-auto mb-8 p-6 rounded-xl shadow-lg flex flex-col gap-4" style={{ background: colors.card, color: colors.text }}>
          <div className="flex items-center gap-3 mb-2">
            <FaGithub className="w-5 h-5" style={{ color: '#333' }} />
            <FaLinkedin className="w-5 h-5" style={{ color: '#0077b5' }} />
            <h3 className="text-lg font-semibold" style={{ color: colors.button }}>Social Accounts</h3>
            {isOwner && !editingSocial && (
              <button onClick={() => setEditingSocial(true)} className="ml-auto px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition">Edit</button>
            )}
          </div>
          {isOwner && editingSocial ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">GitHub URL</label>
                <input
                  type="url"
                  className="w-full rounded border px-2 py-2"
                  value={editGithub}
                  onChange={e => setEditGithub(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  style={{ color: colors.text, background: colors.inputBg, borderColor: colors.inputBorder }}
                  disabled={savingSocial}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  className="w-full rounded border px-2 py-2"
                  value={editLinkedin}
                  onChange={e => setEditLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/yourusername"
                  style={{ color: colors.text, background: colors.inputBg, borderColor: colors.inputBorder }}
                  disabled={savingSocial}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={handleSaveSocial} disabled={savingSocial} className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold">{savingSocial ? 'Saving...' : 'Save'}</button>
                <button onClick={() => { setEditingSocial(false); setEditGithub(profile.github || ''); setEditLinkedin(profile.linkedin || ''); }} className="px-4 py-2 rounded text-sm" style={{ color: colors.inputPlaceholder }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FaGithub className="w-5 h-5" style={{ color: '#333' }} />
                {profile.github ? (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">{profile.github}</a>
                ) : (
                  <span className="text-gray-400">Not linked</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <FaLinkedin className="w-5 h-5" style={{ color: '#0077b5' }} />
                {profile.linkedin ? (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">{profile.linkedin}</a>
                ) : (
                  <span className="text-gray-400">Not linked</span>
                )}
              </div>
            </div>
          )}
          {saveMsg && <div className="text-xs mt-1" style={{ color: saveMsg.includes('Failed') ? colors.error : colors.button }}>{saveMsg}</div>}
        </div>

      </div>
    </div>
  )
}

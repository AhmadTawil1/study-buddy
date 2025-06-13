'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import { useTheme } from '@/src/context/themeContext'
import Card from '@/src/components/common/Card'
import Button from '@/src/components/common/Button'
import { FiUsers, FiMessageCircle, FiCheckCircle, FiTrendingUp } from 'react-icons/fi'
import { fetchCommunityStats, fetchLatestQuestions } from '@/src/firebase/queries'
import Sidebar from '@/src/components/common/Sidebar'
import TitleInput from '@/src/features/ask/components/TitleInput'
import DescriptionInput from '@/src/features/ask/components/DescriptionInput'
import FileUpload from '@/src/components/common/FileUpload'
import TagInput from '@/src/features/ask/components/TagInput'
import PrivacyToggle from '@/src/features/ask/components/PrivacyToggle'
import { requestService } from '@/src/services/requestService'
import { uploadFiles } from '@/src/services/storageService'

const SUBJECTS = ['Math', 'Physics', 'Computer Science', 'Chemistry', 'Biology', 'Other']

export default function AskPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { mode, colors } = useTheme();

  // State for real data
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  // Add all AskForm state here
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [tags, setTags] = useState([])
  const [customTag, setCustomTag] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [clarityScore, setClarityScore] = useState(null)
  const [loadingTitle, setLoadingTitle] = useState(false)
  const [loadingDescription, setLoadingDescription] = useState(false)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [codeSnippet, setCodeSnippet] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('plaintext')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true)
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetchCommunityStats(),
          fetchLatestQuestions()
        ])
        setStats(statsRes)
        setRecent(Array.isArray(recentRes) ? recentRes : (recentRes.questions || []))
      } catch (e) {
        setStats(null)
        setRecent([])
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: colors.page, color: colors.text }}>Loading or redirecting...</div>
  }

  // Prepare stats for display
  const statItems = stats
    ? [
        {
          icon: <FiUsers className="text-blue-500 text-2xl" />,
          label: 'Active Members',
          value: stats.usersHelped?.toLocaleString() || '—',
        },
        {
          icon: <FiMessageCircle className="text-green-500 text-2xl" />,
          label: 'Questions This Week',
          value: stats.questionsThisWeek?.toLocaleString() || '—',
        },
        {
          icon: <FiCheckCircle className="text-purple-500 text-2xl" />,
          label: 'Active Helpers',
          value: stats.activeHelpers?.toLocaleString() || '—',
        },
      ]
    : []

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!title || !description || !subject) {
      setError('Title, description, and subject are required.');
      return;
    }
    setSubmitting(true);
    try {
      let fileDownloadURLs = [];
      if (files.length > 0) {
        fileDownloadURLs = await uploadFiles(
          files,
          `users/${user.uid}/uploads`,
          (index, progress) => {
            // Optionally update progress in UI
          }
        );
      }
      await requestService.createRequest({
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
        codeLanguage: codeLanguage || null,
        clarityScore,
      });
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        router.push('/requests');
      }, 1500);
    } catch (err) {
      setSubmitting(false);
      setError('Failed to submit question. Please try again.');
    }
  }

  return (
    <div className="min-h-screen py-8 px-2 transition-colors duration-300" style={{ background: colors.page, color: colors.text }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Ask Form */}
        <div className="md:col-span-2 flex flex-col gap-8">
          <Card bgColor={colors.card}>
            <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>
              Ask a Question
            </h2>
            <form className="space-y-5 mt-6" onSubmit={handleSubmit}>
              <TitleInput
                value={title}
                onChange={val => {
                  setTitle(val)
                  setClarityScore(val ? Math.min(10, Math.floor(val.length / 10)) : 0)
                }}
                onRephrase={setLoadingTitle}
                loading={loadingTitle}
                clarityScore={clarityScore}
                maxLength={100}
              />
              <DescriptionInput
                value={description}
                onChange={setDescription}
                onRephrase={setLoadingDescription}
                loading={loadingDescription}
              />
              <FileUpload
                files={files}
                setFiles={setFiles}
                dragActive={dragActive}
                setDragActive={setDragActive}
                onFilesAdd={files => setFiles(prev => [...prev, ...files])}
                onFileRemove={idx => setFiles(prev => prev.filter((_, i) => i !== idx))}
              />
              <TagInput
                subject={subject}
                setSubject={setSubject}
                tags={tags}
                setTags={setTags}
                customTag={customTag}
                setCustomTag={setCustomTag}
                onAddTag={tag => { if (tag && !tags.includes(tag)) { setTags([...tags, tag]); setCustomTag('') } }}
                onRemoveTag={tag => setTags(tags.filter(t => t !== tag))}
                subjectsList={SUBJECTS}
              />
              {/* Code Snippet */}
              <div>
                <Button type="button" onClick={() => setShowCodeEditor(v => !v)} className="mb-2" bgColor={colors.button}>
                  {showCodeEditor ? 'Hide Code Editor' : 'Add Code Snippet'}
                </Button>
                {showCodeEditor && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm" style={{ color: colors.text }}>Language:</label>
                      <select
                        value={codeLanguage}
                        onChange={e => setCodeLanguage(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="plaintext">Plaintext</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="csharp">C#</option>
                        <option value="typescript">TypeScript</option>
                        <option value="php">PHP</option>
                        <option value="go">Go</option>
                        <option value="ruby">Ruby</option>
                        <option value="swift">Swift</option>
                        <option value="kotlin">Kotlin</option>
                        <option value="dart">Dart</option>
                        <option value="rust">Rust</option>
                        <option value="racket">Racket</option>
                        <option value="erlang">Erlang</option>
                        <option value="elixir">Elixir</option>
                      </select>
                    </div>
                    <textarea
                      value={codeSnippet}
                      onChange={e => setCodeSnippet(e.target.value)}
                      rows={8}
                      className="w-full border border-gray-300 rounded-lg p-2 font-mono text-sm"
                      placeholder="Paste your code here..."
                      style={{ background: colors.inputBg, color: colors.inputText, borderColor: colors.inputBorder }}
                    />
                  </div>
                )}
              </div>
              <PrivacyToggle
                isPrivate={isPrivate}
                setIsPrivate={setIsPrivate}
                isAnonymous={isAnonymous}
                setIsAnonymous={setIsAnonymous}
              />
              <div className="flex justify-end">
                <Button type="submit" className="px-6" bgColor={colors.button} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Question'}
                </Button>
              </div>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              {success && <div className="text-green-600 text-sm mt-2">Question submitted successfully!</div>}
            </form>
          </Card>
        </div>
        {/* Sidebar */}
        <Sidebar className="md:col-span-1">
          <Card bgColor={colors.card}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Tips for Great Questions</h3>
            <ul className="text-sm space-y-2" style={{ color: colors.inputPlaceholder }}>
              <li>• Be specific and include relevant details</li>
              <li>• Search existing questions first</li>
              <li>• Choose appropriate tags and category</li>
              <li>• Be respectful and constructive</li>
            </ul>
          </Card>
          <Card bgColor={colors.card}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>Recent Questions</h3>
            <div className="space-y-4">
              {recent.map((q) => (
                <div
                  key={q.id}
                  className="rounded-lg p-3"
                  style={{ background: mode === 'dark' ? colors.inputBg : '#f8fafc' }}
                >
                  <div className="font-medium mb-1" style={{ color: colors.text }}>
                    {q.title}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    {q.tags?.map((tag, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs" style={{ color: colors.inputPlaceholder }}>
                    by {q.author || 'Anonymous'} • {q.answersCount || 0} replies • {q.createdAt ? new Date(q.createdAt).toLocaleString() : ''}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Sidebar>
      </div>
    </div>
  )
}

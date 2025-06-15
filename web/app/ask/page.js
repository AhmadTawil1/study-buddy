// Ask Page Route: /ask
// Purpose: Allows authenticated users to submit new questions and view community stats/tips.
// Theme: Uses theme context for background, card, and text colors.
// Features: Question form, file upload, code snippet, privacy toggle, sidebar with tips and recent questions.

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import { useTheme } from '@/src/context/themeContext'
import AskForm from '@/src/features/ask/AskForm'
import Sidebar from '@/src/components/common/Sidebar'
import Card from '@/src/components/common/Card'
import { fetchLatestQuestions } from '@/src/firebase/queries'

export default function AskPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { colors } = useTheme();
  const [recent, setRecent] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchRecent() {
      setLoadingRecent(true)
      try {
        const res = await fetchLatestQuestions()
        setRecent(Array.isArray(res) ? res : (res.questions || []))
      } catch {
        setRecent([])
      } finally {
        setLoadingRecent(false)
      }
    }
    fetchRecent()
  }, [])

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: colors.page, color: colors.text }}>Loading or redirecting...</div>
  }

  // Render the ask page with form and sidebar
  return (
    <div className="min-h-screen py-8 px-2 transition-colors duration-300" style={{ background: colors.page, color: colors.text }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Ask Form */}
        <div className="md:col-span-2 flex flex-col gap-8">
          <Card bgColor={colors.card}>
            <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>
              Ask a Question
            </h2>
            <AskForm />
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
              {loadingRecent ? (
                <div style={{ color: colors.inputPlaceholder }}>Loading...</div>
              ) : recent.length === 0 ? (
                <div style={{ color: colors.inputPlaceholder }}>No recent questions found.</div>
              ) : recent.map((q) => (
                <div
                  key={q.id}
                  className="rounded-lg p-3"
                  style={{ background: colors.inputBg }}
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

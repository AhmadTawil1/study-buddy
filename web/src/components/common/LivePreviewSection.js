"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowRight, FiStar, FiUsers, FiBook } from 'react-icons/fi'
import { fetchLatestQuestions, fetchTopHelpers, fetchFeaturedSubjects } from '@/src/firebase/queries'
import { formatDistanceToNow } from 'date-fns'
import { useTheme } from '@/src/context/themeContext'

export default function LivePreviewSection() {
  const [latestQuestions, setLatestQuestions] = useState([])
  const [topHelpers, setTopHelpers] = useState([])
  const [featuredSubjects, setFeaturedSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const { colors, mode } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questions, helpers, subjects] = await Promise.all([
          fetchLatestQuestions(),
          fetchTopHelpers(),
          fetchFeaturedSubjects()
        ])
        const qs = Array.isArray(questions) ? questions : (questions.questions || [])
        setLatestQuestions(qs)
        setTopHelpers(helpers)
        setFeaturedSubjects(subjects)
      } catch (error) {
        setLatestQuestions([])
        setTopHelpers([])
        setFeaturedSubjects([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <section className="py-16" style={{ background: mode === 'dark' ? 'linear-gradient(90deg, #23272f 0%, #181a20 100%)' : 'linear-gradient(90deg, #f4f6fb 0%, #e5ecf6 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl shadow-lg p-6 animate-pulse" style={{ background: colors.card }}>
                <div className="h-6" style={{ background: colors.inputBg, borderRadius: 8, marginBottom: 24 }}></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-16" style={{ background: colors.inputBg, borderRadius: 8 }}></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16" style={{ background: mode === 'dark' ? 'linear-gradient(90deg, #23272f 0%, #181a20 100%)' : 'linear-gradient(90deg, #f4f6fb 0%, #e5ecf6 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Latest Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-xl shadow-lg p-6 flex flex-col h-full"
            style={{ background: colors.card, color: colors.text }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>Latest Questions</h2>
              <Link href="/requests" style={{ color: colors.button }} className="hover:underline flex items-center gap-1 whitespace-nowrap">
                View all <FiArrowRight />
              </Link>
            </div>
            <div className="space-y-4 flex-1">
              {latestQuestions.map((question) => (
                <Link
                  key={question.id}
                  href={`/questions/${question.id}`}
                  className="block p-4 rounded-lg transition"
                  style={{ background: colors.inputBg, color: colors.text }}
                >
                  <h3 className="font-medium" style={{ color: colors.button }}>{question.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: colors.inputPlaceholder }}>
                    <span>{question.subject}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(question.createdAt, { addSuffix: true })}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Top Helpers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="rounded-xl shadow-lg p-6 flex flex-col h-full"
            style={{ background: colors.card, color: colors.text }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>Top Helpers</h2>
              <Link href="/helpers" style={{ color: colors.button }} className="hover:underline flex items-center gap-1">
                View all <FiArrowRight />
              </Link>
            </div>
            <div className="space-y-4">
              {topHelpers.map((helper) => (
                <div key={helper.id} className="flex items-center gap-4 p-4 rounded-lg transition" style={{ background: colors.inputBg, color: colors.text }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: colors.button + '22' }}>
                    <FiUsers className="w-6 h-6" style={{ color: colors.button }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium" style={{ color: colors.button }}>{helper.displayName}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: colors.inputPlaceholder }}>
                      <span>{helper.subjects?.join(", ") || "General"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FiStar className="w-4 h-4" style={{ color: '#facc15' }} />
                        {helper.rating?.toFixed(1) || "New"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Featured Subjects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-xl shadow-lg p-6"
            style={{ background: colors.card, color: colors.text }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>Featured Subjects</h2>
              <Link href="/subjects" style={{ color: colors.button }} className="hover:underline flex items-center gap-1">
                View all <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {featuredSubjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/subjects/${subject.name.toLowerCase()}`}
                  className="flex items-center gap-3 p-4 rounded-lg transition"
                  style={{ background: colors.inputBg, color: colors.text }}
                >
                  <span className="text-2xl">{subject.icon || "📚"}</span>
                  <div>
                    <h3 className="font-medium" style={{ color: colors.button }}>{subject.name}</h3>
                    <p className="text-sm" style={{ color: colors.inputPlaceholder }}>{subject.questionCount || 0} questions</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 
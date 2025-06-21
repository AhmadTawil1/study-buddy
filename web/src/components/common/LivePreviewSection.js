"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowRight, FiStar, FiUsers, FiBook } from 'react-icons/fi'
import { fetchLatestQuestions, fetchTopHelpers } from '@/src/firebase/queries'
import { formatDistanceToNow } from 'date-fns'
import { useTheme } from '@/src/context/themeContext'
import { requestService } from '@/src/services/requests/requestService'

// src/components/common/LivePreviewSection.js
//
// This component displays a live preview of the StudyBuddy platform activity
// on the homepage. It shows three key sections:
// 1. Latest Questions - Recent questions asked by users
// 2. Top Helpers - Users who have helped others the most
// 3. Unanswered Questions - Questions that still need answers
//
// Features:
// - Real-time data fetching from Firebase
// - Loading states with skeleton animations
// - Responsive grid layout
// - Smooth animations with Framer Motion
// - Fallback content when no data is available
// - Theme-aware styling

export default function LivePreviewSection() {
  // State management for the three data sections
  const [latestQuestions, setLatestQuestions] = useState([]) // Recent questions from users
  const [topHelpers, setTopHelpers] = useState([]) // Users who help others the most
  const [unansweredQuestions, setUnansweredQuestions] = useState([]) // Questions needing answers
  const [loading, setLoading] = useState(true) // Loading state for initial data fetch
  const { colors, mode } = useTheme(); // Theme context for styling

  // Fetch all live preview data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch latest questions and top helpers in parallel for better performance
        const [questionsResult, helpers] = await Promise.all([
          fetchLatestQuestions(),
          fetchTopHelpers()
        ])
        
        // Handle questions data structure - API might return {questions: []} or [] directly
        const questions = questionsResult?.questions || questionsResult || []
        setLatestQuestions(Array.isArray(questions) ? questions.slice(0, 3) : [])
        
        // Handle helpers data - limit to top 3 helpers
        setTopHelpers(Array.isArray(helpers) ? helpers.slice(0, 3) : [])
        
        // Fetch unanswered questions separately (more complex query)
        try {
          const unanswered = await requestService.getRequests({ unanswered: true, sortBy: 'newest' })
          setUnansweredQuestions(Array.isArray(unanswered) ? unanswered.slice(0, 4) : [])
        } catch (unansweredError) {
          console.warn('Failed to fetch unanswered questions:', unansweredError)
          setUnansweredQuestions([]) // Set empty array on error
        }
        
      } catch (error) {
        console.error('Error fetching live preview data:', error)
        // Set fallback data on error - empty arrays will show placeholder content
        setLatestQuestions([])
        setTopHelpers([])
        setUnansweredQuestions([])
      } finally {
        setLoading(false) // Always stop loading, regardless of success/failure
      }
    }
    fetchData()
  }, []) // Empty dependency array - only run on mount

  // Loading skeleton - shows while data is being fetched
  if (loading) {
    return (
      <section className="py-16" style={{ background: mode === 'dark' ? 'linear-gradient(90deg, #23272f 0%, #181a20 100%)' : 'linear-gradient(90deg, #f4f6fb 0%, #e5ecf6 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Generate 3 skeleton cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl shadow-lg p-6 animate-pulse" style={{ background: colors.card }}>
                {/* Skeleton title bar */}
                <div className="h-6" style={{ background: colors.inputBg, borderRadius: 8, marginBottom: 24 }}></div>
                {/* Skeleton content items */}
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
          {/* Section 1: Latest Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-xl shadow-lg p-6 flex flex-col h-full"
            style={{ background: colors.card, color: colors.text }}
          >
            {/* Section header with title and "View all" link */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>Latest Questions</h2>
              <Link href="/requests" style={{ color: colors.button }} className="hover:underline flex items-center gap-1 whitespace-nowrap">
                View all <FiArrowRight />
              </Link>
            </div>
            
            {/* Questions list or placeholder */}
            <div className="space-y-4 flex-1">
              {latestQuestions.length > 0 ? (
                // Display actual questions
                latestQuestions.map((question) => (
                  <Link
                    key={question.id}
                    href={`/requests/${question.id}`}
                    className="block p-4 rounded-lg transition hover:opacity-80"
                    style={{ background: colors.inputBg, color: colors.text }}
                  >
                    <h3 className="font-medium" style={{ color: colors.button }}>{question.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: colors.inputPlaceholder }}>
                      <span>{question.subject}</span>
                      <span>•</span>
                      <span>{question.createdAt ? formatDistanceToNow(question.createdAt, { addSuffix: true }) : 'Recently'}</span>
                    </div>
                  </Link>
                ))
              ) : (
                // Show placeholder when no questions available
                <div className="text-center py-8" style={{ color: colors.inputPlaceholder }}>
                  <FiBook className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No questions yet</p>
                  <p className="text-sm">Be the first to ask!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Section 2: Top Helpers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }} // Slight delay for staggered animation
            viewport={{ once: true }}
            className="rounded-xl shadow-lg p-6 flex flex-col h-full"
            style={{ background: colors.card, color: colors.text }}
          >
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>Top Helpers</h2>
            </div>
            
            {/* Helpers list or placeholder */}
            <div className="space-y-4 flex-1">
              {topHelpers.length > 0 ? (
                // Display actual helpers with their stats
                topHelpers.map((helper) => (
                  <div key={helper.id} className="flex items-center gap-4 p-4 rounded-lg transition" style={{ background: colors.inputBg, color: colors.text }}>
                    {/* Helper avatar/icon */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: colors.button + '22' }}>
                      <FiUsers className="w-6 h-6" style={{ color: colors.button }} />
                    </div>
                    
                    {/* Helper details */}
                    <div className="flex-1">
                      <Link href={`/profile/${helper.id}`} className="font-medium hover:underline" style={{ color: colors.button }}>{helper.displayName}</Link>
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
                ))
              ) : (
                // Show placeholder when no helpers available
                <div className="text-center py-8" style={{ color: colors.inputPlaceholder }}>
                  <FiUsers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No helpers yet</p>
                  <p className="text-sm">Start helping to appear here!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Section 3: Unanswered Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }} // More delay for staggered animation
            viewport={{ once: true }}
            className="rounded-xl shadow-lg p-6"
            style={{ background: colors.card, color: colors.text }}
          >
            {/* Section header with description */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>Unanswered Questions</h2>
                <div className="text-sm mt-1" style={{ color: colors.inputPlaceholder }}>
                  Be the one to help a peer by answering their question!
                </div>
              </div>
              <Link href="/requests?filter=unanswered" style={{ color: colors.button }} className="hover:underline flex items-center gap-1">
                View all <FiArrowRight />
              </Link>
            </div>
            
            {/* Unanswered questions list or placeholder */}
            <div className="space-y-4 flex-1">
              {unansweredQuestions.length > 0 ? (
                // Display actual unanswered questions
                unansweredQuestions.map((question) => (
                  <Link
                    key={question.id}
                    href={`/requests/${question.id}`}
                    className="block p-4 rounded-lg transition hover:opacity-80"
                    style={{ background: colors.inputBg, color: colors.text }}
                  >
                    <h3 className="font-medium" style={{ color: colors.button }}>{question.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: colors.inputPlaceholder }}>
                      <span>{question.subject}</span>
                      <span>•</span>
                      <span>{question.createdAtFormatted || (question.createdAt ? formatDistanceToNow(new Date(question.createdAt), { addSuffix: true }) : 'Recently')}</span>
                    </div>
                  </Link>
                ))
              ) : (
                // Show placeholder when no unanswered questions
                <div className="text-center py-8" style={{ color: colors.inputPlaceholder }}>
                  <FiBook className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No unanswered questions</p>
                  <p className="text-sm">Great! All questions have answers!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 
"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowRight, FiStar, FiUsers, FiBook } from 'react-icons/fi'
import { fetchLatestQuestions, fetchTopHelpers, fetchFeaturedSubjects } from '@/src/firebase/firebase'
import { formatDistanceToNow } from 'date-fns'

export default function LivePreviewSection() {
  const [latestQuestions, setLatestQuestions] = useState([])
  const [topHelpers, setTopHelpers] = useState([])
  const [featuredSubjects, setFeaturedSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questions, helpers, subjects] = await Promise.all([
          fetchLatestQuestions(),
          fetchTopHelpers(),
          fetchFeaturedSubjects()
        ])
        setLatestQuestions(questions)
        setTopHelpers(helpers)
        setFeaturedSubjects(subjects)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-16 bg-gray-100 rounded"></div>
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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Latest Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Latest Questions</h2>
              <Link href="/requests" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 whitespace-nowrap">
                View all <FiArrowRight />
              </Link>
            </div>
            <div className="space-y-4 flex-1">
              {latestQuestions.map((question) => (
                <Link
                  key={question.id}
                  href={`/questions/${question.id}`}
                  className="block p-4 rounded-lg hover:bg-gray-50 transition"
                >
                  <h3 className="font-medium text-gray-900">{question.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
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
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top Helpers</h2>
              <Link href="/helpers" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <FiArrowRight />
              </Link>
            </div>
            <div className="space-y-4">
              {topHelpers.map((helper) => (
                <div key={helper.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{helper.displayName}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>{helper.subjects?.join(", ") || "General"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FiStar className="w-4 h-4 text-yellow-400" />
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
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Featured Subjects</h2>
              <Link href="/subjects" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {featuredSubjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/subjects/${subject.name.toLowerCase()}`}
                  className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-2xl">{subject.icon || "📚"}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{subject.name}</h3>
                    <p className="text-sm text-gray-500">{subject.questionCount || 0} questions</p>
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
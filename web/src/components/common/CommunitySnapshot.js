"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiMessageSquare, FiTrendingUp } from 'react-icons/fi'
import { fetchCommunityStats, fetchTrendingTopics } from '@/src/firebase/queries'
import { useTheme } from '@/src/context/themeContext'

export default function CommunitySnapshot() {
  const [stats, setStats] = useState({
    usersHelped: 0,
    questionsThisWeek: 0,
    activeHelpers: 0
  })
  const [trendingTopics, setTrendingTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const { colors, mode } = useTheme()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [communityStats, topics] = await Promise.all([
          fetchCommunityStats(),
          fetchTrendingTopics()
        ])
        setStats(communityStats)
        setTrendingTopics(topics)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statsData = [
    { id: 1, label: "Users Helped", value: `${stats.usersHelped.toLocaleString()}+`, icon: FiUsers },
    { id: 2, label: "Questions This Week", value: `${stats.questionsThisWeek.toLocaleString()}+`, icon: FiMessageSquare },
    { id: 3, label: "Active Helpers", value: `${stats.activeHelpers.toLocaleString()}+`, icon: FiTrendingUp },
  ]

  if (loading) {
    return (
      <section className="py-16" style={{ background: mode === 'dark' ? 'linear-gradient(90deg, #23272f 0%, #181a20 100%)' : 'linear-gradient(90deg, #f4f6fb 0%, #e5ecf6 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <div className="h-8" style={{ background: colors.inputBg, borderRadius: 8, margin: '0 auto 16px' }}></div>
            <div className="h-4" style={{ background: colors.inputBg, borderRadius: 8, margin: '0 auto' }}></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl shadow-lg p-8 text-center animate-pulse" style={{ background: colors.card }}>
                <div className="w-16 h-16" style={{ background: colors.inputBg, borderRadius: '50%', margin: '0 auto 16px' }}></div>
                <div className="h-8" style={{ background: colors.inputBg, borderRadius: 8, margin: '0 auto 8px' }}></div>
                <div className="h-4" style={{ background: colors.inputBg, borderRadius: 8, margin: '0 auto' }}></div>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>Our Growing Community</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.inputPlaceholder }}>
            Join thousands of students and helpers who are already part of our learning community
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-xl shadow-lg p-8 text-center"
              style={{ background: colors.card, color: colors.text }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: colors.button + '22' }}>
                <stat.icon className="w-8 h-8" style={{ color: colors.button }} />
              </div>
              <div className="text-4xl font-bold mb-2" style={{ color: colors.button }}>{stat.value}</div>
              <div style={{ color: colors.inputPlaceholder }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="rounded-xl shadow-lg p-8"
          style={{ background: colors.card, color: colors.text }}
        >
          <h3 className="text-xl font-bold mb-6 text-center" style={{ color: colors.button }}>Trending Topics</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {trendingTopics.map((topic, index) => (
              <motion.span
                key={topic}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer"
                style={{ background: colors.inputBg, color: colors.button }}
              >
                {topic}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
} 
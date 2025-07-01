"use client"
import { useEffect, useState } from 'react'
import { FiUsers, FiMessageSquare } from 'react-icons/fi'
import { fetchCommunityStats, fetchTrendingTopics } from '@/src/firebase/queries'
import { useTheme } from '@/src/context/themeContext'

export default function CommunitySnapshot() {
  const [stats, setStats] = useState({ users: 0, questions: 0 })
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const { colors, mode } = useTheme()

  useEffect(() => {
    (async () => {
      try {
        const [s, t] = await Promise.all([
          fetchCommunityStats(),
          fetchTrendingTopics()
        ])
        setStats({ users: s.users, questions: s.questions })
        setTopics(t)
      } finally { setLoading(false) }
    })()
  }, [])

  const statsData = [
    { label: "Total Users", value: (stats.users ?? 0).toLocaleString(), icon: FiUsers },
    { label: "Total Questions", value: (stats.questions ?? 0).toLocaleString(), icon: FiMessageSquare },
  ]

  if (loading) return (
    <section className="py-16" style={{ background: mode === 'dark' ? 'linear-gradient(90deg, #23272f 0%, #181a20 100%)' : 'linear-gradient(90deg, #f4f6fb 0%, #e5ecf6 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="h-8" style={{ background: colors.inputBg, borderRadius: 8, margin: '0 auto 16px' }}></div>
          <div className="h-4" style={{ background: colors.inputBg, borderRadius: 8, margin: '0 auto' }}></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[1, 2].map(i => (
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

  return (
    <section className="py-16" style={{ background: mode === 'dark' ? 'linear-gradient(90deg, #23272f 0%, #181a20 100%)' : 'linear-gradient(90deg, #f4f6fb 0%, #e5ecf6 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>Our Growing Community</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.inputPlaceholder }}>
            Join thousands of users who are already part of our learning community
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {statsData.map(stat => (
            <div key={stat.label} className="rounded-xl shadow-lg p-8 text-center" style={{ background: colors.card, color: colors.text }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: colors.button + '22' }}>
                <stat.icon className="w-8 h-8" style={{ color: colors.button }} />
              </div>
              <div className="text-4xl font-bold mb-2" style={{ color: colors.button }}>{stat.value}</div>
              <div style={{ color: colors.inputPlaceholder }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl shadow-lg p-8" style={{ background: colors.card, color: colors.text }}>
          <h3 className="text-xl font-bold mb-6 text-center" style={{ color: colors.button }}>Trending Topics</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {topics.map(topic => (
              <span key={topic} className="px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer" style={{ background: colors.inputBg, color: colors.button }}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 
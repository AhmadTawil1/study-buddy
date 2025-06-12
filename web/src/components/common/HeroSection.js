"use client"
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { useTheme } from '@/src/context/themeContext'

export default function HeroSection() {
  const [subject, setSubject] = useState('')
  const { colors, mode } = useTheme()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (subject.trim()) {
      window.location.href = `/ask?subject=${encodeURIComponent(subject)}`
    }
  }

  return (
    <section
      className="relative py-20 md:py-28 w-full overflow-hidden"
      style={{
        background: mode === 'dark'
          ? 'linear-gradient(180deg, #181a20 0%, #23272f 100%)'
          : 'linear-gradient(180deg, #e5ecf6 0%, #f4f6fb 100%)',
        color: colors.text
      }}
    >
      {/* Background animation */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex-1 text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight"
                style={{ color: colors.button }}>
              Ask, Help, Grow — <span style={{ color: mode === 'dark' ? '#60a5fa' : colors.button }}>Together</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto md:mx-0" style={{ color: colors.inputPlaceholder }}>
              Join our community of learners and helpers. Get answers to your questions, share your knowledge, and grow your skills with StudyBuddy.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mb-12">
              <Link href="/ask">
                <button style={{ background: colors.button, color: colors.buttonSecondaryText }}
                  className="px-8 py-3 rounded-lg font-semibold shadow hover:opacity-90 transition text-lg flex items-center gap-2">
                  Start Asking <FiArrowRight />
                </button>
              </Link>
              <Link href="/requests">
                <button style={{ background: colors.buttonSecondary, color: colors.button }}
                  className="px-8 py-3 rounded-lg font-semibold border border-blue-200 hover:opacity-90 transition text-lg">
                  Browse Requests
                </button>
              </Link>
            </div>
            {/* AI-powered onboarding prompt */}
            <div className="rounded-xl shadow-lg p-6 max-w-md mx-auto md:mx-0"
                 style={{ background: colors.card, color: colors.text }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>What subject do you need help in today?</h3>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Mathematics, Physics..."
                  className="flex-1 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ background: colors.inputBg, color: colors.text, border: `1px solid ${colors.inputBorder}` }}
                />
                <button
                  type="submit"
                  style={{ background: colors.button, color: colors.buttonSecondaryText }}
                  className="px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Go
                </button>
              </form>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex-1 flex justify-center md:justify-end mt-12 md:mt-0"
          >
            <img
              src="/home.jpg"
              alt="StudyBuddy"
              className="w-full h-auto max-w-xl object-contain drop-shadow-xl"
              style={{ borderRadius: '1.5rem', boxShadow: mode === 'dark' ? '0 4px 32px #0008' : '0 4px 32px #60a5fa22' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

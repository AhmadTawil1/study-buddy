"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { useTheme } from '@/src/context/themeContext'

export default function HeroSection() {
  const { colors, mode } = useTheme()

  return (
    <section
      className="relative py-12 sm:py-20 md:py-28 w-full overflow-hidden"
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex-1 text-center md:text-left"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight"
                style={{ color: colors.button }}>
              Ask, Help, Grow — <span style={{ color: mode === 'dark' ? '#60a5fa' : colors.button }}>Together</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-10 max-w-2xl mx-auto md:mx-0" style={{ color: colors.inputPlaceholder }}>
              Join our community of learners and helpers. Get answers to your questions, share your knowledge, and grow your skills with StudyBuddy.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row justify-center md:justify-start sm:gap-4 mb-8 sm:mb-12 w-full">
              <div className="flex w-full items-center justify-start">
                <Link href="/ask">
                  <button style={{ background: colors.button, color: colors.buttonSecondaryText }}
                    className="px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold shadow hover:opacity-90 transition text-base sm:text-lg flex items-center gap-2"
                    aria-label="Start Asking">
                    Start Asking <FiArrowRight />
                  </button>
                </Link>
              </div>
              <div className="flex w-full items-center justify-center">
                <Link href="/requests">
                  <button style={{ background: colors.buttonSecondary, color: colors.button }}
                    className="w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold border border-blue-200 hover:opacity-90 transition text-base sm:text-lg"
                    aria-label="Browse Requests">
                    Browse Requests
                  </button>
                </Link>
              </div>
            </div>
            {/* Professional user flow: Think -> Ask -> Peer */}
            <div className="flex justify-center mt-8 mb-2">
              <div
                className="w-full max-w-2xl rounded-2xl shadow-lg px-4 py-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 border"
                style={{
                  background: mode === 'dark' ? colors.card : '#fff',
                  color: colors.text,
                  borderColor: mode === 'dark' ? '#23272f' : '#e5e7eb',
                  boxShadow: mode === 'dark' ? '0 2px 8px #0004' : '0 2px 8px #0001'
                }}
              >
                {/* Step 1 */}
                <div className="flex flex-col items-center flex-1 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ background: mode === 'dark' ? '#1e293b' : '#e0e7ff' }}>
                    <span className="text-2xl" style={{ color: colors.button }}>💡</span>
                  </div>
                  <div className="font-bold text-base sm:text-lg mb-1" style={{ color: colors.button }}>Think</div>
                  <div className="text-xs sm:text-sm" style={{ color: colors.inputPlaceholder }}>Identify your question or challenge.</div>
                </div>
                {/* Arrow/Divider */}
                <div className="hidden sm:flex flex-col items-center justify-center">
                  <div className="w-10 h-1 rounded-full mb-1" style={{ background: mode === 'dark' ? '#334155' : '#c7d2fe' }}></div>
                  <span className="text-xl" style={{ color: colors.button }}>→</span>
                  <div className="w-10 h-1 rounded-full mt-1" style={{ background: mode === 'dark' ? '#334155' : '#c7d2fe' }}></div>
                </div>
                {/* Step 2 */}
                <div className="flex flex-col items-center flex-1 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ background: mode === 'dark' ? '#1e293b' : '#e0e7ff' }}>
                    <span className="text-2xl" style={{ color: colors.button }}>❓</span>
                  </div>
                  <div className="font-bold text-base sm:text-lg mb-1" style={{ color: colors.button }}>Ask</div>
                  <div className="text-xs sm:text-sm" style={{ color: colors.inputPlaceholder }}>Post your question to the community.</div>
                </div>
                {/* Arrow/Divider */}
                <div className="hidden sm:flex flex-col items-center justify-center">
                  <div className="w-10 h-1 rounded-full mb-1" style={{ background: mode === 'dark' ? '#334155' : '#c7d2fe' }}></div>
                  <span className="text-xl" style={{ color: colors.button }}>→</span>
                  <div className="w-10 h-1 rounded-full mt-1" style={{ background: mode === 'dark' ? '#334155' : '#c7d2fe' }}></div>
                </div>
                {/* Step 3 */}
                <div className="flex flex-col items-center flex-1 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ background: mode === 'dark' ? '#1e293b' : '#e0e7ff' }}>
                    <span className="text-2xl" style={{ color: colors.button }}>🤝</span>
                  </div>
                  <div className="font-bold text-base sm:text-lg mb-1" style={{ color: colors.button }}>Connect</div>
                  <div className="text-xs sm:text-sm" style={{ color: colors.inputPlaceholder }}>Get help from peers and experts.</div>
                </div>
              </div>
            </div>
            {/* AI-powered onboarding prompt
            <div className="rounded-xl shadow-lg p-4 sm:p-6 max-w-md w-full mx-auto md:mx-0"
                 style={{ background: colors.card, color: colors.text }}>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: colors.text }}>What subject do you need help in today?</h3>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Mathematics, Physics..."
                  className="flex-1 px-3 sm:px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base w-full"
                  style={{ background: colors.inputBg, color: colors.text, border: `1px solid ${colors.inputBorder}` }}
                />
                <button
                  type="submit"
                  style={{ background: colors.button, color: colors.buttonSecondaryText }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg hover:opacity-90 transition text-sm sm:text-base"
                >
                  Go
                </button>
              </form>
            </div> */}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0"
          >
            <img
              src="/home.jpg"
              alt="StudyBuddy"
              className="w-full max-w-xs sm:max-w-md md:max-w-xl h-auto object-contain drop-shadow-xl"
              style={{ borderRadius: '1.5rem', boxShadow: mode === 'dark' ? '0 4px 32px #0008' : '0 4px 32px #60a5fa22' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

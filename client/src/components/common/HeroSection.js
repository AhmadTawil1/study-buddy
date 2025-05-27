"use client"
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

export default function HeroSection() {
  const [subject, setSubject] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (subject.trim()) {
      window.location.href = `/ask?subject=${encodeURIComponent(subject)}`
    }
  }

  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 md:py-28 w-full overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-800 mb-6 leading-tight">
              Ask, Help, Grow — <span className="text-blue-600">Together</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto md:mx-0">
              Join our community of learners and helpers. Get answers to your questions, share your knowledge, and grow your skills with StudyBuddy.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mb-12">
              <Link href="/ask">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition text-lg flex items-center gap-2">
                  Start Asking <FiArrowRight />
                </button>
              </Link>
              <Link href="/requests">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-200 hover:bg-blue-50 transition text-lg">
                  Browse Requests
                </button>
              </Link>
            </div>

            {/* AI-powered onboarding prompt */}
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto md:mx-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What subject do you need help in today?</h3>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Mathematics, Physics..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
              src="../../public/file.svg"
              alt="Students collaborating"
              className="w-full max-w-lg drop-shadow-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

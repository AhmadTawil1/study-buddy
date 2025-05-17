"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="bg-white py-20 md:py-28 w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="flex-1 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-800 mb-6 leading-tight">
            Welcome to <span className="text-blue-900">StudyBuddy</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto md:mx-0">
            We connect students who need help with peers who love to teach. Ask questions, get answers, and grow together — powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <Link href="/signup">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition text-lg">
                Join Now
              </button>
            </Link>
            <Link href="/requests">
              <button className="bg-blue-50 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-100 transition text-lg">
                Explore Requests
              </button>
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex-1 flex justify-center md:justify-end mt-12 md:mt-0"
        >
          <img src="/globe.svg" alt="StudyBuddy illustration" className="w-48 md:w-72 lg:w-96 drop-shadow-xl max-w-full" />
        </motion.div>
      </div>
    </section>
  )
}

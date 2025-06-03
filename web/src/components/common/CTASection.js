"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CTASection() {
  return (
    <section className="bg-sky-100 py-20 md:py-28 w-full flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-10 md:p-14 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-800">Become a StudyBuddy Today</h2>
          <p className="mb-10 text-lg md:text-xl text-gray-700">
            Help others. Get help. Learn smarter — together.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link href="/signup">
              <button className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-blue-700 transition text-lg">
                Sign Up
              </button>
            </Link>
            <Link href="/login">
              <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 hover:text-blue-700 transition text-lg">
                Login
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

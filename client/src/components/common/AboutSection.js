"use client"
import { motion } from 'framer-motion'

export default function AboutSection() {
  return (
    <section className="bg-blue-50 py-20 md:py-28 w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-16 md:gap-24">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="flex-1 flex justify-center md:justify-start mb-8 md:mb-0"
        >
          <img src="/file.svg" alt="About StudyBuddy" className="w-40 md:w-56 lg:w-64 drop-shadow-xl max-w-full" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex-1"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-800">Why StudyBuddy?</h2>
            <p className="text-gray-700 text-lg mb-3">
              We believe every student deserves a study partner — anytime, anywhere.
            </p>
            <p className="text-gray-700 text-base">
              StudyBuddy fills the gap for timely academic help by creating a peer-to-peer network where asking questions and helping others is fun and rewarding. Whether you're stuck on homework or want to share your expertise, StudyBuddy gives you the tools, visibility, and AI support to make a difference.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

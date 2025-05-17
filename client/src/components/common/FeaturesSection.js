"use client"
import { motion } from 'framer-motion'

const features = [
  {
    title: 'Ask Questions Easily',
    description: 'Submit questions with images, topics, or urgency level.',
    icon: '📝',
  },
  {
    title: 'Get Help from Peers',
    description: 'Connect with experienced students who love teaching.',
    icon: '🤝',
  },
  {
    title: 'AI-Powered Assistance',
    description: 'Rephrase unclear questions or summarize answers instantly.',
    icon: '🤖',
  },
]

export default function FeaturesSection() {
  return (
    <section className="bg-indigo-50 py-20 md:py-28 w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-blue-800">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-14">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-10 rounded-2xl shadow-xl flex flex-col items-center text-center hover:shadow-2xl transition"
            >
              <div className="text-6xl mb-6">{f.icon}</div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-blue-700">{f.title}</h3>
              <p className="text-gray-700 text-base md:text-lg">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"
import { motion } from 'framer-motion'

const steps = [
  { icon: '📝', title: 'Ask or Offer Help', desc: 'Submit or view requests on the platform.' },
  { icon: '💬', title: 'Communicate', desc: 'Chat, respond, and improve answers with AI.' },
  { icon: '🏅', title: 'Build Reputation', desc: 'Gain badges and build your helper profile.' },
]

export default function HowItWorksSection() {
  return (
    <section className="bg-blue-50 py-20 md:py-28 w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-blue-800">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-14">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i === 0 ? -40 : i === 2 ? 40 : 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="flex-1 bg-white rounded-2xl shadow-xl p-8 md:p-10 flex flex-col items-center text-center hover:shadow-2xl transition"
            >
              <div className="text-6xl mb-6">{step.icon}</div>
              <h4 className="font-bold text-xl md:text-2xl text-blue-700 mb-3">{step.title}</h4>
              <p className="text-gray-700 text-base md:text-lg">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

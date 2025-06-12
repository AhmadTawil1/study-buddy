"use client"
import { motion } from 'framer-motion'
import { useTheme } from '@/src/context/themeContext'

const steps = [
  { icon: '📝', title: 'Ask or Offer Help', desc: 'Submit or view requests on the platform.' },
  { icon: '💬', title: 'Communicate', desc: 'Chat, respond, and improve answers with AI.' },
  { icon: '🏅', title: 'Build Reputation', desc: 'Gain badges and build your helper profile.' },
]

export default function HowItWorksSection() {
  const { colors, mode } = useTheme();
  return (
    <section
      className="py-20 md:py-28 w-full"
      style={{
        background: mode === 'dark'
          ? 'linear-gradient(90deg, #181a20 0%, #23272f 100%)'
          : 'linear-gradient(90deg, #e5ecf6 0%, #f4f6fb 100%)',
        color: colors.text
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14" style={{ color: colors.button }}>How It Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-14">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i === 0 ? -40 : i === 2 ? 40 : 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="flex-1 rounded-2xl shadow-xl p-8 md:p-10 flex flex-col items-center text-center hover:shadow-2xl transition"
              style={{ background: colors.card, color: colors.text }}
            >
              <div className="text-6xl mb-6">{step.icon}</div>
              <h4 className="font-bold text-xl md:text-2xl mb-3" style={{ color: colors.button }}>{step.title}</h4>
              <p className="text-base md:text-lg" style={{ color: colors.inputPlaceholder }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

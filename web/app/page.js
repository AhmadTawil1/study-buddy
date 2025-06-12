'use client'
import { useTheme } from '../src/context/themeContext';
import HeroSection from '../src/components/common/HeroSection'
import AboutSection from '../src/components/common/AboutSection'
import FeaturesSection from '../src/components/common/FeaturesSection'
import HowItWorksSection from '../src/components/common/HowItWorksSection'
import LivePreviewSection from '../src/components/common/LivePreviewSection'
import CommunitySnapshot from '../src/components/common/CommunitySnapshot'

export default function HomePage() {
  const { colors } = useTheme();
  return (
    <div style={{ minHeight: '100vh', background: colors.page, color: colors.text }}>
      <main className="w-full">
        <HeroSection />
        <LivePreviewSection />
        <AboutSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CommunitySnapshot />
      </main>
    </div>
  )
}

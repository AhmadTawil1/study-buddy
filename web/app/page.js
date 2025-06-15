// Home Page Route: /
// Purpose: Renders the StudyBuddy landing page with all main sections.
// Theme: Uses theme context for background and text color.
// Sections: Hero, Live Preview, About, Features, How It Works, Community Snapshot.

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
    // Main page container with theme background and text color
    <div style={{ minHeight: '100vh', background: colors.page, color: colors.text }}>
      <main className="w-full">
        {/* Hero section at the top */}
        <HeroSection />
        {/* Live preview of the platform */}
        <LivePreviewSection />
        {/* About the platform */}
        <AboutSection />
        {/* Key features */}
        <FeaturesSection />
        {/* How the platform works */}
        <HowItWorksSection />
        {/* Community stats and snapshot */}
        <CommunitySnapshot />
      </main>
    </div>
  )
}

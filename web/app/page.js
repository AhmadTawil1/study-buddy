import HeroSection from '../src/components/common/HeroSection'
import AboutSection from '../src/components/common/AboutSection'
import FeaturesSection from '../src/components/common/FeaturesSection'
import HowItWorksSection from '../src/components/common/HowItWorksSection'
import LivePreviewSection from '../src/components/common/LivePreviewSection'
import CommunitySnapshot from '../src/components/common/CommunitySnapshot'
import Footer from '../src/components/layout/Footer'
import Navbar from '../src/components/layout/Navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <main className="w-full">
        <HeroSection />
        <LivePreviewSection />
        <AboutSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CommunitySnapshot />
      </main>
      {/* <Footer /> */}
    </div>
  )
}

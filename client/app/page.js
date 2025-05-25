import HeroSection from '../src/components/common/HeroSection'
import AboutSection from '../src/components/common/AboutSection'
import FeaturesSection from '../src/components/common/FeaturesSection'
import HowItWorksSection from '../src/components/common/HowItWorksSection'
import CTASection from '../src/components/common/CTASection'

export default function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  )
}

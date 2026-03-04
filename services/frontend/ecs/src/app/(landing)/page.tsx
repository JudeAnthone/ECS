import HeroSection from "@/shared/components/page/landing/HeroSection"
import StatsSection from "@/shared/components/page/landing/StatsSection"
import AnnouncementsSection from "@/shared/components/page/landing/AnnouncementsSection"
import ProjectsSection from "@/shared/components/page/landing/ProjectsSection"
import FeatureSection from "@/shared/components/page/landing/FeatureSection"
import ReportsSection from "@/shared/components/page/landing/ReportsSection"
import FAQSection from "@/shared/components/page/landing/FaqSection"

export default function Page() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <AnnouncementsSection />
      <ProjectsSection />
      <FeatureSection />
      <ReportsSection />
      <FAQSection />
    </main>
  )
}
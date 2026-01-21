import HeroSection from "@/shared/components/page/landing/HeroSection"
import FeatureSection from "@/shared/components/page/landing/FeatureSection"
import FAQSection from "@/shared/components/page/landing/FaqSection"

export default function Page(){
    return(
        <main>
            <HeroSection /> 
            <FeatureSection /> 
            <FAQSection />  
        </main>
    )
}
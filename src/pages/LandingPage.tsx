
import { Navbar } from "../components/Navbar";
import { RevealOnScroll } from "../components/ui/RevealOnScroll";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { HowItWorks } from "../components/HowItWorks";
import { PricingSection } from "../components/PricingSection";
import { Footer } from "../components/Footer";

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/30">
            <Navbar />
            <main className="relative z-10">
                <RevealOnScroll>
                    <HeroSection />
                </RevealOnScroll>
                <RevealOnScroll delay={0.2}>
                    <FeaturesSection />
                </RevealOnScroll>
                <RevealOnScroll delay={0.2}>
                    <HowItWorks />
                </RevealOnScroll>
                <RevealOnScroll delay={0.2}>
                    <PricingSection />
                </RevealOnScroll>
            </main>
            <Footer />
        </div>
    );
};

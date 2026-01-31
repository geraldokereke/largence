"use client";

import dynamic from "next/dynamic";
import { Hero } from "@/components/Hero";
import { TrustedBySection } from "@/components/landing/TrustedBySection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ProductShowcaseSection } from "@/components/landing/ProductShowcaseSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { ProductHuntSection } from "@/components/landing/ProductHuntSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

// Import Navbar dynamically with no SSR since it uses useTheme
const Navbar = dynamic(
  () => import("@/components/Navbar").then((mod) => ({ default: mod.Navbar })),
  {
    ssr: false,
  },
);

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ProductHuntSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ProductShowcaseSection />
      {/* <SecuritySection />
      <TestimonialsSection /> */}
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}

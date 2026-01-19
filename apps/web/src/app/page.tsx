"use client";

import dynamic from "next/dynamic";
import { Hero } from "@/components/Hero";
import {FeaturesSection} from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { Footer } from "@/components/landing/Footer";
import LegalPlatformCards from "@/components/landing/LegalPlatformsCards";

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
      <LegalPlatformCards/>
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { UseCasesSection } from "@/components/landing/UseCasesSection";
import { SolutionsSection } from "@/components/landing/SolutionsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { Footer } from "@/components/landing/Footer";
import { CookieConsent } from "@/components/landing/CookieConsent";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <CookieConsent />

      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-0 bottom-0 left-4 sm:left-6 lg:left-8 xl:left-[calc((100%-1152px)/2)] border-l border-border/50 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-4 sm:right-6 lg:right-8 xl:right-[calc((100%-1152px)/2)] border-r border-border/50 pointer-events-none" />

      <svg
        className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid-pattern"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      <svg
        className="absolute top-0 left-0 w-full h-[800px] opacity-20 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="animated-diamonds"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 100 50 L 50 100 L 0 50 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary/30"
            >
              <animate
                attributeName="stroke-opacity"
                values="0.2;0.5;0.2"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
          </pattern>

          <pattern
            id="animated-hexagons"
            width="120"
            height="104"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 30 0 L 90 0 L 120 52 L 90 104 L 30 104 L 0 52 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-accent/30"
            >
              <animate
                attributeName="stroke-opacity"
                values="0.3;0.6;0.3"
                dur="5s"
                repeatCount="indefinite"
                begin="1s"
              />
            </path>
          </pattern>

          <pattern
            id="animated-circles"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary/20"
            >
              <animate
                attributeName="r"
                values="28;33;28"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                values="0.2;0.4;0.2"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          </pattern>
        </defs>

        <rect
          x="0"
          y="0"
          width="40%"
          height="100%"
          fill="url(#animated-diamonds)"
          opacity="0.4"
        />
        <rect
          x="60%"
          y="0"
          width="40%"
          height="60%"
          fill="url(#animated-hexagons)"
          opacity="0.3"
        />
        <rect
          x="25%"
          y="20%"
          width="50%"
          height="60%"
          fill="url(#animated-circles)"
          opacity="0.5"
        />
      </svg>

      <Navbar />
      <Hero />
      <FeaturesSection />
      <UseCasesSection />
      <SolutionsSection />
      <PricingSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}

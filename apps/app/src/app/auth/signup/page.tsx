"use client"

import { SignupForm } from "@largence/components/signup-form";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    title: "AI Document Drafting",
    description: "Generate contracts, NDAs, employment agreements, and policies with AI. Customize by jurisdiction, add clauses, and export as PDF or DOCX.",
    features: ["Multi-country templates", "Smart clause suggestions"],
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Compliance Auditing",
    description: "AI audits documents for compliance gaps, missing clauses, and regulatory alignment across NDPR, GDPR, CCPA, and African data protection laws.",
    features: ["Compliance scoring", "Risk flagging"],
  },
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    title: "Enterprise Governance",
    description: "Manage document lifecycle with approval workflows, role-based access, audit trails, and e-signature integration. Full accountability.",
    features: ["Approval workflows", "Audit trails"],
  },
  {
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    title: "Multi-Country Templates",
    description: "Access legally-reviewed templates for Nigeria, Ghana, Kenya, and South Africa. Localized for employment acts, data laws, and compliance frameworks.",
    features: ["Region-specific", "Pre-vetted clauses"],
  }
];

export default function SignupPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Don't render the signup page if user is already signed in
  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Signup Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="Largence Logo"
              width={40}
              height={40}
              className="mb-6"
            />
          </div>
          <SignupForm />
        </div>
      </div>

      {/* Right side - Marketing/Feature Content */}
      <div className="hidden lg:flex bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10" />
        
        {/* Decorative SVG Background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
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

        {/* Floating shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 flex flex-col justify-center p-12 max-w-2xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Built for African legal teams
            </div>
            <h2 className="text-5xl font-bold mb-4 font-display leading-tight">
              Join Largence Today
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Be part of the next generation of legal operations in Africa. 
              Generate compliant documents, audit contracts, and manage your legal workflow, all powered by AI.
            </p>
          </div>
          
          {/* Carousel Container */}
          <div className="relative h-80 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : index < currentSlide
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
                }`}
              >
                <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-border/50 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <svg
                        className="h-7 w-7 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={feature.icon}
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold font-display">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                    {feature.description}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {feature.features.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="pt-8 border-t border-border/40">
            <div className="grid grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary font-display mb-1">4</p>
                <p className="text-sm text-muted-foreground">Countries supported</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary font-display mb-1">AI</p>
                <p className="text-sm text-muted-foreground">Powered drafting</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary font-display mb-1">24/7</p>
                <p className="text-sm text-muted-foreground">Platform access</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Start generating compliant documents today</p>
                <p className="text-xs text-muted-foreground">
                  30-day money-back guarantee • Dedicated support • Regular updates
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

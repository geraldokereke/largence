"use client";

import { SignupForm } from "@largence/components/signup-form";
import Image from "next/image";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

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

      {/* Right side - Marketing with Stacked Screenshots */}
      <div className="hidden lg:flex bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

        {/* Floating shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          {/* Short Marketing Text */}
          <div className="mb-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Built for African legal teams
            </div>
            <h2 className="text-4xl font-bold mb-3 font-display leading-tight">
              Join Largence Today
            </h2>
            <p className="text-muted-foreground">
              AI-powered legal documents, compliance auditing, and governance tools.
            </p>
          </div>

          {/* Stacked/Overlapping Screenshots */}
          <div className="relative h-105 w-full max-w-xl">
            {/* Back screenshot */}
            <div className="absolute top-0 left-0 w-[85%] rounded-sm border border-border/50 bg-card shadow-2xl overflow-hidden transform -rotate-2 z-10">
              <Image
                src="/screenshots/1 - Light.png"
                alt="Largence Dashboard"
                width={600}
                height={400}
                className="w-full h-auto dark:hidden"
              />
              <Image
                src="/screenshots/1.png"
                alt="Largence Dashboard"
                width={600}
                height={400}
                className="w-full h-auto hidden dark:block"
              />
            </div>

            {/* Middle screenshot */}
            <div className="absolute top-16 left-16 w-[85%] rounded-sm border border-border/50 bg-card shadow-2xl overflow-hidden transform rotate-1 z-20">
              <Image
                src="/screenshots/2 - Light.png"
                alt="Largence Document Editor"
                width={600}
                height={400}
                className="w-full h-auto dark:hidden"
              />
              <Image
                src="/screenshots/2.png"
                alt="Largence Document Editor"
                width={600}
                height={400}
                className="w-full h-auto hidden dark:block"
              />
            </div>

            {/* Front screenshot */}
            <div className="absolute top-32 left-32 w-[85%] rounded-sm border border-border/50 bg-card shadow-2xl overflow-hidden transform rotate-3 z-30">
              <Image
                src="/screenshots/3 - Light.png"
                alt="Largence Compliance"
                width={600}
                height={400}
                className="w-full h-auto dark:hidden"
              />
              <Image
                src="/screenshots/3.png"
                alt="Largence Compliance"
                width={600}
                height={400}
                className="w-full h-auto hidden dark:block"
              />
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="mt-10 flex items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>4 Countries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span>24/7 Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

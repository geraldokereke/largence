"use client";

import { LoginForm } from "@largence/components/login-form";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Don't render the login page if user is already signed in
  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-svh w-full flex flex-col lg:grid lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-8 lg:p-10 flex-1 overflow-y-auto">
        <div className="flex justify-center gap-2 md:justify-start shrink-0">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image
              src="/logo.png"
              alt="Largence Logo"
              width={32}
              height={32}
              className="shrink-0"
            />
            <span className="text-xl font-semibold tracking-tight font-heading">
              Largence
            </span>
          </a>
        </div>
        <div className="flex-1 items-center justify-center py-4 sm:py-6 md:py-8 overflow-y-auto">
          <div className="w-full max-w-md px-0 scrollbar-hide">
            <LoginForm />
          </div>
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
              Built for legal teams and enterprises
            </div>
            <h2 className="text-4xl font-bold mb-3 font-display leading-tight">
              Welcome back
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

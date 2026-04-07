"use client";

import { LoginForm } from "@largence/components/login-form";
import { AuthMarketingPanel } from "@largence/components/auth-marketing-panel";
import Image from "next/image";
import { useEffect } from "react";
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

  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-svh w-full flex flex-col lg:grid lg:grid-cols-2">
      {/* Left side - Form in a card */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 flex-1 overflow-y-auto">
        {/* Subtle dot pattern background */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--foreground) / 0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
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
          </div>

          {/* Card wrapping the form */}
          <div className="rounded-lg border bg-card/80 p-6 sm:p-8">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right side - Brand panel */}
      <AuthMarketingPanel grainId="login-grain" />
    </div>
  );
}

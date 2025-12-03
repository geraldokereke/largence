"use client";

import { ForgotPasswordForm } from "@largence/components/forgot-password-form";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ForgotPasswordPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Don't render the forgot password page if user is already signed in
  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Forgot Password Form */}
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
          <ForgotPasswordForm />
        </div>
      </div>

      {/* Right side - Help Content */}
      <div className="hidden lg:flex bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative z-10 flex flex-col justify-center p-12 max-w-2xl">
          <h2 className="text-4xl font-semibold mb-6 font-display">
            Need Help?
          </h2>
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="font-semibold text-lg mb-2">
                Password Reset Process
              </h3>
              <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Enter your email address</li>
                <li>Check your inbox for a verification code</li>
                <li>Enter the code and create a new password</li>
                <li>Sign in with your new password</li>
              </ol>
            </div>

            <div className="p-6 rounded-lg bg-card border">
              <h3 className="font-semibold text-lg mb-2">
                Didn't receive the code?
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes and try again</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-primary/10 border border-primary/20">
              <h3 className="font-semibold text-lg mb-2">
                Still having trouble?
              </h3>
              <p className="text-muted-foreground mb-4">
                Contact our support team for assistance
              </p>
              <a
                href="mailto:support@largence.com"
                className="text-primary hover:underline font-medium"
              >
                support@largence.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

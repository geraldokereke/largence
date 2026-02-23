"use client";

import { useState } from "react";
import { cn } from "@largence/lib/utils";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Label } from "@largence/components/ui/label";
import { Spinner } from "@largence/components/ui/spinner";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import { useLoginForm } from "@largence/hooks/use-login-form";
import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";

interface LoginFormProps {
  className?: string;
  title?: string;
  description?: string;
  onSubmit?: (email: string, password: string) => Promise<void>;
}

export function LoginForm({
  className,
  title = "Welcome Back",
  description = "Sign in to your Largence workspace to continue",
  onSubmit,
}: LoginFormProps) {
  const {
    showPassword,
    isLoading,
    error,
    fieldErrors,
    togglePasswordVisibility,
    handleSubmit,
  } = useLoginForm();
  const { signIn } = useSignIn();
  const [oauthLoading, setOauthLoading] = useState<
    "google" | "microsoft" | null
  >(null);

  const handleOAuthSignIn =
    (provider: "oauth_google" | "oauth_microsoft") => async () => {
      if (!signIn) return;

      try {
        setOauthLoading(provider === "oauth_google" ? "google" : "microsoft");
        await signIn.authenticateWithRedirect({
          strategy: provider,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/onboarding",
        });
      } catch (err) {
        console.error("OAuth error:", err);
        setOauthLoading(null);
      }
    };

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-6 sm:mb-8 text-center md:text-left">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 font-display">{title}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
      </div>

      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm">Work Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            disabled={isLoading}
            autoComplete="email"
            className={cn(
              "h-9 rounded-sm text-sm",
              fieldErrors.email && "border-destructive focus:border-destructive"
            )}
          />
          {fieldErrors.email && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 text-destructive" />
              <p className="text-xs text-destructive font-semibold">{fieldErrors.email}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete="current-password"
              className={cn(
                "h-9 rounded-sm text-sm pr-10",
                fieldErrors.password && "border-destructive focus:border-destructive"
              )}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 text-destructive" />
              <p className="text-xs text-destructive font-semibold">{fieldErrors.password}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-9 rounded-sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            type="button"
            onClick={handleOAuthSignIn("oauth_google")}
            disabled={isLoading || oauthLoading !== null}
            className="w-full h-9 rounded-sm"
          >
            {oauthLoading === "google" ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Connecting...
              </span>
            ) : (
              <>
                <FaGoogle className="h-4 w-4" />
                Continue with Google
              </>
            )}
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={handleOAuthSignIn("oauth_microsoft")}
            disabled={isLoading || oauthLoading !== null}
            className="w-full h-9 rounded-sm"
          >
            {oauthLoading === "microsoft" ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Connecting...
              </span>
            ) : (
              <>
                <FaMicrosoft className="h-4 w-4" />
                Continue with Microsoft
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          New to our platform?{" "}
          <Link
            href="/auth/signup"
            className="text-primary hover:underline font-medium"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

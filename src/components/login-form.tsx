"use client";

import { cn } from "@largence/lib/utils";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Label } from "@largence/components/ui/label";
import { Spinner } from "@largence/components/ui/spinner";
import { Eye, EyeOff, ShieldCheck, Key, Cloud } from "lucide-react";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import { useLoginForm } from "@largence/hooks/use-login-form";

interface LoginFormProps {
  className?: string;
  title?: string;
  description?: string;
  forgotPasswordUrl?: string;
  signUpUrl?: string;
  onSubmit?: (email: string, password: string) => Promise<void>;
  onGoogleLogin?: () => void;
  onMicrosoftLogin?: () => void;
  onAzureADLogin?: () => void;
  onSAMLLogin?: () => void;
  onSSLLogin?: () => void;
}

export function LoginForm({
  className,
  title = "Welcome Back",
  description = "Sign in to your Largence account to continue",
  forgotPasswordUrl = "#",
  signUpUrl = "#",
  onSubmit,
  onGoogleLogin,
  onMicrosoftLogin,
  onAzureADLogin,
  onSAMLLogin,
  onSSLLogin,
}: LoginFormProps) {
  const { showPassword, isLoading, togglePasswordVisibility, handleSubmit } =
    useLoginForm();

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 font-(family-name:--font-general-sans)">
          {title}
        </h1>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">Work Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            required
            disabled={isLoading}
            autoComplete="email"
            className="h-10 rounded-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a
              href={forgotPasswordUrl}
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              autoComplete="current-password"
              className="h-10 rounded-sm pr-10"
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
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-sm"
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
            onClick={onGoogleLogin}
            disabled={isLoading}
            className="w-full h-10 rounded-sm"
          >
            <FaGoogle className="h-4 w-4" />
            Continue with Google
          </Button>
          
          <Button
            variant="outline"
            type="button"
            onClick={onMicrosoftLogin}
            disabled={isLoading}
            className="w-full h-10 rounded-sm"
          >
            <FaMicrosoft className="h-4 w-4" />
            Continue with Microsoft
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Enterprise SSO
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={onSAMLLogin}
            disabled={isLoading}
            className="h-10 rounded-sm"
          >
            <ShieldCheck className="h-4 w-4" />
            SAML 2.0
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={onSSLLogin}
            disabled={isLoading}
            className="h-10 rounded-sm"
          >
            <Key className="h-4 w-4" />
            SSL Certificate
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          New to our platform?{" "}
          <a
            href={signUpUrl}
            className="text-primary hover:underline font-medium"
          >
            Request access
          </a>
        </p>
      </form>
    </div>
  );
}

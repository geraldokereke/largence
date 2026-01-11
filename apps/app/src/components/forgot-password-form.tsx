"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { cn } from "@largence/lib/utils";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Label } from "@largence/components/ui/label";
import { Spinner } from "@largence/components/ui/spinner";
import { Eye, EyeOff, Mail, Check } from "lucide-react";
import Link from "next/link";

interface ForgotPasswordFormProps {
  className?: string;
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const handleSendCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!signIn) {
        throw new Error("SignIn is not available");
      }

      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setStep("code");
      setSuccess("We've sent a verification code to your email");
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(
        err?.errors?.[0]?.message ||
          "Failed to send reset code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!signIn) {
        throw new Error("SignIn is not available");
      }

      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setStep("success");
      } else {
        setError("Password reset incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err?.errors?.[0]?.message || "Invalid code or password");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className={cn("w-full", className)}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold mb-2 font-display">
            Password Reset Successful
          </h1>
          <p className="text-muted-foreground">
            Your password has been successfully reset
          </p>
        </div>

        <Button
          onClick={() => router.push("/")}
          className="w-full h-8 rounded-sm"
        >
          Continue to Dashboard
        </Button>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className={cn("w-full", className)}>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2 font-display">
            Reset Your Password
          </h1>
          <p className="text-muted-foreground">
            Enter the verification code and your new password
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleResetPassword}>
          {error && (
            <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-sm bg-primary/10 border border-primary/20 text-primary text-sm">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              name="code"
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={isLoading}
              className="rounded-sm"
              maxLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="rounded-sm pr-10"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-8 rounded-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Resetting password...
              </span>
            ) : (
              "Reset Password"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-primary hover:underline font-medium"
            >
              Use a different email
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 font-display">
          Forgot Password?
        </h1>
        <p className="text-muted-foreground">
          No worries, we'll send you reset instructions
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSendCode}>
        {error && (
          <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
            className="rounded-sm"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-8 rounded-sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Sending code...
            </span>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send Reset Code
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

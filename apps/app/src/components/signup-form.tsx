"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { cn } from "@largence/lib/utils";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Label } from "@largence/components/ui/label";
import { Spinner } from "@largence/components/ui/spinner";
import { Eye, EyeOff, Check } from "lucide-react";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import Link from "next/link";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@largence/components/ui/input-otp";

interface SignupFormProps {
  className?: string;
}

export function SignupForm({ className }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [oauthLoading, setOauthLoading] = useState<
    "google" | "microsoft" | null
  >(null);
  const [password, setPassword] = useState("");
  const { signUp, setActive } = useSignUp();
  const router = useRouter();

  // Password validation
  const validatePassword = (pass: string) => {
    const hasMinLength = pass.length >= 8;
    const hasNumber = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return {
      hasMinLength,
      hasNumber,
      hasSpecialChar,
      isValid: hasMinLength && hasNumber && hasSpecialChar,
    };
  };

  const passwordValidation = validatePassword(password);

  const handleOAuthSignUp =
    (provider: "oauth_google" | "oauth_microsoft") => async () => {
      if (!signUp) return;

      try {
        setOauthLoading(provider === "oauth_google" ? "google" : "microsoft");
        await signUp.authenticateWithRedirect({
          strategy: provider,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/onboarding",
        });
      } catch (err) {
        console.error("OAuth error:", err);
        setOauthLoading(null);
      }
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const firstName = formData.get("firstName") as string;
      const lastName = formData.get("lastName") as string;

      // Validate password
      const validation = validatePassword(password);
      if (!validation.isValid) {
        setError(
          "Password must be at least 8 characters and contain a number and special character",
        );
        setIsLoading(false);
        return;
      }

      if (!signUp) {
        throw new Error("SignUp is not available");
      }

      // Start the sign up process
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // Send the verification email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(
        err?.errors?.[0]?.message ||
          "Failed to create account. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!signUp) {
        throw new Error("SignUp is not available");
      }

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/onboarding");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err?.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className={cn("w-full", className)}>
        <div className="mb-6 sm:mb-8 text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2 font-display">
            Verify Your Email
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            We've sent a verification code to your email address.
          </p>
        </div>

        <form className="space-y-4 sm:space-y-6" onSubmit={handleVerify}>
          {error && (
            <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full h-8 rounded-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Verifying...
              </span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Verify Email
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-6 sm:mb-8 text-center lg:text-left">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2 font-display">
          Create Your Account
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Get started with Largence today</p>
      </div>

      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="John"
              required
              disabled={isLoading}
              autoComplete="given-name"
              className="h-9 rounded-sm text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Doe"
              required
              disabled={isLoading}
              autoComplete="family-name"
              className="h-9 rounded-sm text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm">Work Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            required
            disabled={isLoading}
            autoComplete="email"
            className="h-9 rounded-sm text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              required
              disabled={isLoading}
              autoComplete="new-password"
              className="h-9 rounded-sm text-sm pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  passwordValidation.hasMinLength
                    ? "bg-green-500"
                    : "bg-muted-foreground/30"
                }`}
              />
              <span
                className={
                  passwordValidation.hasMinLength
                    ? "text-green-500"
                    : "text-muted-foreground"
                }
              >
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  passwordValidation.hasNumber
                    ? "bg-green-500"
                    : "bg-muted-foreground/30"
                }`}
              />
              <span
                className={
                  passwordValidation.hasNumber
                    ? "text-green-500"
                    : "text-muted-foreground"
                }
              >
                Contains a number
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  passwordValidation.hasSpecialChar
                    ? "bg-green-500"
                    : "bg-muted-foreground/30"
                }`}
              />
              <span
                className={
                  passwordValidation.hasSpecialChar
                    ? "text-green-500"
                    : "text-muted-foreground"
                }
              >
                Contains a special character
              </span>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-9 rounded-sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Creating account...
            </span>
          ) : (
            "Create Account"
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
            onClick={handleOAuthSignUp("oauth_google")}
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
            onClick={handleOAuthSignUp("oauth_microsoft")}
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
          Already have an account?{" "}
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

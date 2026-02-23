"use client";

import { useState } from "react";
import { useSignUp, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { cn } from "@largence/lib/utils";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Label } from "@largence/components/ui/label";
import { Spinner } from "@largence/components/ui/spinner";
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import Link from "next/link";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@largence/components/ui/input-otp";
import { signupSchema } from "@largence/lib/validations/user.schema";

interface SignupFormProps {
  className?: string;
}

export function SignupForm({ className }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [oauthLoading, setOauthLoading] = useState<
    "google" | "microsoft" | null
  >(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();
  const router = useRouter();

  // Password validation
  const validatePassword = (pass: string) => {
    const hasMinLength = pass.length >= 8;
    const hasNumber = /\d/.test(pass);
    const hasUppercase = /[A-Z]/.test(pass);
    return {
      hasMinLength,
      hasNumber,
      hasUppercase,
      isValid: hasMinLength && hasNumber && hasUppercase,
    };
  };

  const passwordValidation = validatePassword(password);

  const handleOAuthSignUp =
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const formData = new FormData(event.currentTarget);

    const raw = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
    };

    // Clear previous errors
    setFieldErrors({});
    setError(null);

    const result = signupSchema.safeParse(raw);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }

    const { email, password, firstName, lastName } = result.data;

    if (!signUp) throw new Error("SignUp is not available");

    await signUp.create({
      emailAddress: email,
      password,
      firstName,
      lastName,
    });

    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

    setPendingVerification(true);
  } catch (err: any) {
    console.error("Signup error:", err);
    setError(
      err?.errors?.[0]?.message || "Failed to create account. Please try again."
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
      setError(err?.errors?.[0]?.message || "The OTP entered is invalid. Please check your email and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className={cn("w-full", className)}>
        <div className="mb-6 sm:mb-8 text-center md:text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 font-display">
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
      <div className="mb-6 sm:mb-8 text-center md:text-left">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 font-display">
          Create Your Account
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Get started with Largence today</p>
      </div>

      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="John"
              disabled={isLoading}
              autoComplete="given-name"
              className={cn(
                "h-9 rounded-sm text-sm",
                fieldErrors.firstName && "border-destructive focus:border-destructive"
              )}
            />
            {fieldErrors.firstName && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 text-destructive" />
                <p className="text-xs text-destructive font-semibold">{fieldErrors.firstName}</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Doe"
              disabled={isLoading}
              autoComplete="family-name"
              className={cn(
                "h-9 rounded-sm text-sm",
                fieldErrors.lastName && "border-destructive focus:border-destructive"
              )}
            />
            {fieldErrors.lastName && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 text-destructive" />
                <p className="text-xs text-destructive font-semibold">{fieldErrors.lastName}</p>
              </div>
            )}
          </div>
        </div>

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
          <Label htmlFor="password" className="text-sm">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
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
                  passwordValidation.hasUppercase
                    ? "bg-green-500"
                    : "bg-muted-foreground/30"
                }`}
              />
              <span
                className={
                  passwordValidation.hasUppercase
                    ? "text-green-500"
                    : "text-muted-foreground"
                }
              >
                Contains uppercase letter
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              disabled={isLoading}
              autoComplete="new-password"
              className={cn(
                "h-9 rounded-sm text-sm pr-10",
                fieldErrors.confirmPassword && "border-destructive focus:border-destructive"
              )}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          {fieldErrors.confirmPassword && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 text-destructive" />
              <p className="text-xs text-destructive font-semibold">{fieldErrors.confirmPassword}</p>
            </div>
          )}
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

        {/* Clerk CAPTCHA widget container for bot protection */}
        <div id="clerk-captcha" />

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

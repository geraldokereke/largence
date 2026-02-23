"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { loginSchema } from "@largence/lib/validations/login.schema";

export function useLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit =
    (onSubmit?: (email: string, password: string) => Promise<void>) =>
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);
      setError(null);

      try {
        const formData = new FormData(event.currentTarget);

        const raw = {
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        };

        // Clear previous errors
        setFieldErrors({});
        setError(null);

        const result = loginSchema.safeParse(raw);

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

        const { email, password } = result.data;

        if (onSubmit) {
          await onSubmit(email, password);
        } else {
          // Use Clerk to sign in
          if (!signIn) {
            throw new Error("SignIn is not available");
          }

          const result = await signIn.create({
            identifier: email,
            password,
          });

          if (result.status === "complete") {
            await setActive({ session: result.createdSessionId });
            router.push("/onboarding");
          }
        }
      } catch (err: any) {
        console.error("Login error:", err);
        setError(err?.errors?.[0]?.message || "Invalid email or password");
        setIsLoading(false);
      }
    };

  return {
    showPassword,
    isLoading,
    error,
    fieldErrors,
    togglePasswordVisibility,
    handleSubmit,
  };
}

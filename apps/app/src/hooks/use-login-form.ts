"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function useLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

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
          } else {
            // Handle other statuses if needed
            console.log("Sign in status:", result.status);
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
    togglePasswordVisibility,
    handleSubmit,
  };
}

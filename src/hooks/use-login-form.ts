import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (
    onSubmit?: (email: string, password: string) => Promise<void>
  ) => async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      
      if (onSubmit) {
        await onSubmit(email, password);
      } else {
        // Default behavior - simulate API call
        console.log("Form submitted:", { email, password });
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Navigate to onboarding after successful login
        router.push("/onboarding");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Handle error appropriately
      setIsLoading(false);
    }
  };

  return {
    showPassword,
    isLoading,
    togglePasswordVisibility,
    handleSubmit,
  };
}
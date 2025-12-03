"use client";

import { useEffect } from "react";
import { Button } from "@largence/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Something went wrong!
          </h2>
          <p className="text-muted-foreground">
            We apologize for the inconvenience. Please try again.
          </p>
        </div>
        <Button onClick={reset} className="w-full sm:w-auto">
          Try again
        </Button>
      </div>
    </div>
  );
}

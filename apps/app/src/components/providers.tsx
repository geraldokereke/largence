"use client";

import * as React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { RouteLoading } from "./route-loading";
import { Toaster } from "./ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider>
          <RouteLoading />
          {children}
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
          />
        </QueryProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

"use client";

import { AppSidebar } from "@largence/components/app-sidebar";
import { SiteHeader } from "@largence/components/site-header";
import { AccountHeader } from "@largence/components/account-header";
import { PageTransition } from "@largence/components/page-transition";
import { SidebarInset, SidebarProvider } from "@largence/components/ui/sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@largence/components/ui/button";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Check if we're on the account page
  const isAccountPage = pathname === "/account";

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebar:state");
    if (stored !== null) {
      setOpen(stored === "true");
    }
  }, []);

  // Persist sidebar state changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    localStorage.setItem("sidebar:state", String(newOpen));
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  // Special layout for account page (no sidebar)
  if (isAccountPage) {
    return (
      <div className="flex flex-col h-screen">
        <AccountHeader />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    );
  }

  // Standard layout with sidebar for all other pages
  return (
    <div className="[--header-height:calc(--spacing(14))] h-screen flex flex-col">
        <SidebarProvider
          open={open}
          onOpenChange={handleOpenChange}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <SiteHeader />
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar />
            <SidebarInset className="overflow-y-auto">
              <PageTransition>{children}</PageTransition>
            </SidebarInset>
          </div>
        </SidebarProvider>
    </div>
  );
}

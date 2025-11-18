"use client"

import { AppSidebar } from "@largence/components/app-sidebar"
import { SiteHeader } from "@largence/components/site-header"
import { AccountHeader } from "@largence/components/account-header"
import { PageTransition } from "@largence/components/page-transition"
import {
  SidebarInset,
  SidebarProvider,
} from "@largence/components/ui/sidebar"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@largence/components/ui/button"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [cookieAccepted, setCookieAccepted] = useState(false)
  const [showCookie, setShowCookie] = useState(false)

  // Check if we're on the account page
  const isAccountPage = pathname === "/account"

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("sidebar:state")
    if (stored !== null) {
      setOpen(stored === "true")
    }
    // Cookie consent check
    const consent = localStorage.getItem("cookie:accepted")
    setCookieAccepted(consent === "true")
    setShowCookie(consent !== "true")
  }, [])

  // Persist sidebar state changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    localStorage.setItem("sidebar:state", String(newOpen))
  }

  const handleAcceptCookie = () => {
    localStorage.setItem("cookie:accepted", "true")
    setCookieAccepted(true)
    setShowCookie(false)
  }
  const handleCloseCookie = () => {
    setShowCookie(false)
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  // Special layout for account page (no sidebar)
  if (isAccountPage) {
    return (
      <div className="flex flex-col min-h-screen">
        <AccountHeader />
        <main className="flex-1 flex flex-col">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    )
  }

  // Standard layout with sidebar for all other pages
  return (
    <>
      {/* Cookie Consent Dialog */}
      {showCookie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border rounded-sm shadow-xl p-6 w-full max-w-md mx-auto flex flex-col gap-5 relative">
            <button
              onClick={handleCloseCookie}
              className="absolute top-3 right-3 p-2 rounded-sm hover:bg-muted/40 transition-colors cursor-pointer"
              aria-label="Close cookie dialog"
            >
              <X className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-lg font-semibold mb-2 font-heading">Cookie & Data Usage</h2>
              <p className="text-sm text-muted-foreground mb-2">
                To provide you with the best experience, Largence uses cookies and collects data for:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground mb-2">
                <li>Analytics & usage statistics</li>
                <li>Personalized ads & marketing</li>
                <li>Improving product features</li>
                <li>Security & fraud prevention</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our use of cookies and data collection as described in our <a href="/privacy" target="_blank" className="underline">Privacy Policy</a>.
              </p>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button size="sm" className="h-9 rounded-sm px-4 font-medium cursor-pointer" onClick={handleAcceptCookie}>
                Accept & Continue
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider 
          open={open}
          onOpenChange={handleOpenChange}
          className="flex flex-col"
        >
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <PageTransition>
                {children}
              </PageTransition>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </>
  )
}

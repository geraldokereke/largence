"use client"

import { AppSidebar } from "@largence/components/app-sidebar"
import { SiteHeader } from "@largence/components/site-header"
import { PageTransition } from "@largence/components/page-transition"
import {
  SidebarInset,
  SidebarProvider,
} from "@largence/components/ui/sidebar"
import { useEffect, useState } from "react"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("sidebar:state")
    if (stored !== null) {
      setOpen(stored === "true")
    }
  }, [])

  // Persist sidebar state changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    localStorage.setItem("sidebar:state", String(newOpen))
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
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
  )
}

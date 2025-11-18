"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@largence/components/ui/button"
import { Home } from "lucide-react"

export function CreateHeader() {
  const router = useRouter()

  return (
    <div className="border-b bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-sm gap-2"
            onClick={() => router.push("/")}
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="Largence Logo" 
            width={24} 
            height={24}
            className="shrink-0"
          />
          <span className="text-lg font-semibold tracking-tight font-heading">
            Largence
          </span>
        </div>
        <div className="w-32"></div>
      </div>
    </div>
  )
}

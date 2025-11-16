"use client"

import { Moon, Sun, Monitor, Check } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@largence/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-sm cursor-pointer">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-sm w-40">
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer rounded-sm">
          <Sun className="mr-2 h-4 w-4" />
          <span className="flex-1">Light</span>
          {theme === "light" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer rounded-sm">
          <Moon className="mr-2 h-4 w-4" />
          <span className="flex-1">Dark</span>
          {theme === "dark" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer rounded-sm">
          <Monitor className="mr-2 h-4 w-4" />
          <span className="flex-1">System</span>
          {theme === "system" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

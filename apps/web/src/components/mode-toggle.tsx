"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@largence/ui";

export function ModeToggle() {
    const { setTheme, theme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle theme"
            >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
                <span className="sr-only">Toggle theme</span>
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-32 py-1 bg-background border rounded-md shadow-lg z-50">
                        <button
                            onClick={() => {
                                setTheme("light");
                                setIsOpen(false);
                            }}
                            className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors ${theme === "light" ? "text-primary" : "text-foreground"
                                }`}
                        >
                            <Sun className="h-4 w-4" />
                            Light
                        </button>
                        <button
                            onClick={() => {
                                setTheme("dark");
                                setIsOpen(false);
                            }}
                            className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors ${theme === "dark" ? "text-primary" : "text-foreground"
                                }`}
                        >
                            <Moon className="h-4 w-4" />
                            Dark
                        </button>
                        <button
                            onClick={() => {
                                setTheme("system");
                                setIsOpen(false);
                            }}
                            className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors ${theme === "system" ? "text-primary" : "text-foreground"
                                }`}
                        >
                            <Monitor className="h-4 w-4" />
                            System
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

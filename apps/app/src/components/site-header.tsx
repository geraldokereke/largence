"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  Bell,
  Plus,
  Settings,
  User,
  CreditCard,
  LogOut,
  HelpCircle,
  Shield,
  Palette,
  Globe,
  Keyboard,
  Sun,
  Moon,
  Monitor,
  Check,
  Search,
  Command as CommandIcon,
  FileText,
  Brain,
  ShieldCheck,
  Folder,
  Users as UsersIcon,
  FileStack,
  Plug2Icon,
  Home,
  Command,
  CheckCheck,
  Clock,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import { Spinner } from "@largence/components/ui/spinner";
import { NotificationDrawer } from "@largence/components/notification-drawer";
import { NewDocumentDialog } from "@largence/components/new-document-dialog";

import { Button } from "@largence/components/ui/button";
import { SidebarTrigger } from "@largence/components/ui/sidebar";
import { ModeToggle } from "@largence/components/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@largence/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@largence/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@largence/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@largence/components/ui/avatar";

const commands = [
  {
    group: "Navigation",
    items: [
      { icon: Home, label: "Dashboard", shortcut: "⌘H", path: "/dashboard" },
      {
        icon: FileText,
        label: "Documents",
        shortcut: "⌘D",
        path: "/documents",
      },
      // { icon: Brain, label: "AI Drafts", shortcut: "⌘B", path: "/drafts" },
      {
        icon: ShieldCheck,
        label: "Compliance",
        shortcut: "⌘C",
        path: "/compliance",
      },
      { icon: Folder, label: "Templates", shortcut: "⌘T", path: "/templates" },
      { icon: UsersIcon, label: "Teams", shortcut: "⌘M", path: "/teams" },
      { icon: FileStack, label: "Audit Trail", shortcut: "⌘L", path: "/audit" },
      {
        icon: Plug2Icon,
        label: "Integrations",
        shortcut: "⌘I",
        path: "/integrations",
      },
    ],
  },
  {
    group: "Actions",
    items: [
      { icon: Plus, label: "Create Document", shortcut: "⌘N", path: "/create" },
    ],
  },
  {
    group: "Settings",
    items: [
      { icon: User, label: "Account", shortcut: "⌘P", path: "/account" },
      { icon: Settings, label: "Settings", shortcut: "⌘S", path: "/settings" },
      {
        icon: Keyboard,
        label: "Keyboard Shortcuts",
        shortcut: "⌘A",
        path: "/keyboard",
      },
    ],
  },
];

export function SiteHeader() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [newDocDialogOpen, setNewDocDialogOpen] = React.useState(false);

  // Avoid hydration mismatch for theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    router.push("/login");
    setIsLoggingOut(false);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push("/account");
      }
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push("/settings");
      }
      // Removed Cmd+A shortcut to allow native select-all functionality
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router]);

  const runCommand = React.useCallback((command: () => void) => {
    setCommandOpen(false);
    command();
  }, []);

  return (
    <>
      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard"))}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
              <CommandShortcut>⌘H</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/documents"))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Documents</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/drafts"))}
            >
              <Brain className="mr-2 h-4 w-4" />
              <span>AI Drafts</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/compliance"))}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              <span>Compliance</span>
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/templates"))}
            >
              <Folder className="mr-2 h-4 w-4" />
              <span>Templates</span>
              <CommandShortcut>⌘T</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/teams"))}
            >
              <UsersIcon className="mr-2 h-4 w-4" />
              <span>Teams</span>
              <CommandShortcut>⌘M</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/audit"))}
            >
              <FileStack className="mr-2 h-4 w-4" />
              <span>Audit Trail</span>
              <CommandShortcut>⌘L</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/integrations"))}
            >
              <Plug2Icon className="mr-2 h-4 w-4" />
              <span>Integrations</span>
              <CommandShortcut>⌘I</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/create"))}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Create Document</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/account"))}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Account</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/settings"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/keyboard"))}
            >
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard Shortcuts</span>
              <CommandShortcut>⌘A</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="text-center sm:text-center">
            <div className="flex justify-center mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <LogOut className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <DialogTitle>Log out of Largence?</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You'll need to sign in again
              to access your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 w-full pt-2">
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-sm"
              onClick={() => setLogoutDialogOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-10 rounded-sm flex items-center justify-center gap-2"
              onClick={confirmLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Spinner size="sm" variant="white" />
                  Logging Out...
                </>
              ) : (
                "Log out"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
        <div className="flex h-14 w-full items-center px-2 sm:px-4 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <SidebarTrigger className="h-9 w-9 sm:mr-1.5" />
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Largence Logo"
                width={28}
                height={28}
                className="shrink-0"
              />
              <span className="hidden sm:inline text-lg font-semibold tracking-tight font-heading">
                Largence
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center gap-2 max-w-2xl mx-auto min-w-0">
            <button
              onClick={() => setCommandOpen(true)}
              className="w-full max-w-md h-9 px-3 sm:px-3 rounded-sm border bg-background hover:bg-accent transition-colors flex items-center gap-2 text-sm text-muted-foreground"
              data-walkthrough="search"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="hidden xs:inline truncate">
                Search or enter a Command
              </span>
              <span className="xs:hidden">Search...</span>
              <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 md:flex">
                <Command className="h-3 w-3" />K
              </kbd>
            </button>
            <Button
              variant="default"
              size="sm"
              className="h-9 rounded-sm gap-2 shrink-0 p cursor-pointer px-2 sm:px-3"
              onClick={() => setNewDocDialogOpen(true)}
              data-walkthrough="create-document"
            >
              <span className="hidden md:inline">Create</span>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <NotificationDrawer />

            <div className="hidden sm:block">
              <ModeToggle />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex h-9 w-9 rounded-sm"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-sm">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      window.open("/account?tab=profile", "_blank")
                    }
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Account</span>
                    <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                      <Palette className="mr-2 h-4 w-4" />
                      <span>Appearance</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48 rounded-sm p-1">
                      <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold">
                        Theme Preference
                      </DropdownMenuLabel>
                      <div className="px-1 py-1">
                        <DropdownMenuItem
                          onClick={() => setTheme("light")}
                          className="cursor-pointer rounded-sm px-2 py-2"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-sm border bg-background">
                              <Sun className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium">Light</span>
                              <span className="text-xs text-muted-foreground">
                                Bright and clear
                              </span>
                            </div>
                          </div>
                          {mounted && theme === "light" && (
                            <Check className="h-4 w-4 ml-2 text-primary" />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setTheme("dark")}
                          className="cursor-pointer rounded-sm px-2 py-2"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-sm border bg-background">
                              <Moon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium">Dark</span>
                              <span className="text-xs text-muted-foreground">
                                Easy on the eyes
                              </span>
                            </div>
                          </div>
                          {mounted && theme === "dark" && (
                            <Check className="h-4 w-4 ml-2 text-primary" />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setTheme("system")}
                          className="cursor-pointer rounded-sm px-2 py-2"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-sm border bg-background">
                              <Monitor className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium">
                                System
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Follows device
                              </span>
                            </div>
                          </div>
                          {mounted && theme === "system" && (
                            <Check className="h-4 w-4 ml-2 text-primary" />
                          )}
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      window.open("/account?tab=language", "_blank")
                    }
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    <span>Language & Region</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setCommandOpen(true)}
                  >
                    <Keyboard className="mr-2 h-4 w-4" />
                    <span>Keyboard Shortcuts</span>
                    <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      window.open("/account?tab=privacy", "_blank")
                    }
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Privacy & Security</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      window.open("/account?tab=billing", "_blank")
                    }
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/help")}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    // Reset and restart the app walkthrough
                    localStorage.removeItem("largence:app-walkthrough-completed");
                    window.location.reload();
                  }}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Replay Tour</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={!isLoaded}>
                <Button
                  variant="ghost"
                  className="h-9 w-9 rounded-full p-0 cursor-pointer"
                  disabled={!isLoaded}
                  data-walkthrough="user-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={user?.fullName || "User"}
                    />
                    <AvatarFallback>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-sm">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.fullName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      window.open("/account?tab=profile", "_blank")
                    }
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      window.open("/account?tab=preferences", "_blank")
                    }
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      window.open("/account?tab=billing", "_blank")
                    }
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* New Document Dialog */}
      <NewDocumentDialog open={newDocDialogOpen} onOpenChange={setNewDocDialogOpen} />
    </>
  );
}

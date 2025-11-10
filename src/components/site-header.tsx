"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useClerk, useUser } from "@clerk/nextjs";
import { Bell, Plus, Settings, User, CreditCard, LogOut, HelpCircle, Shield, Palette, Globe, Keyboard, Sun, Moon, Monitor, Check, Search, Command as CommandIcon, FileText, Brain, ShieldCheck, Folder, Users as UsersIcon, FileStack, Plug2Icon, Home, Command, CheckCheck, Clock, AlertCircle, X } from "lucide-react";

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
      { icon: FileText, label: "Documents", shortcut: "⌘D", path: "/documents" },
      { icon: Brain, label: "AI Drafts", shortcut: "⌘B", path: "/drafts" },
      { icon: ShieldCheck, label: "Compliance", shortcut: "⌘C", path: "/compliance" },
      { icon: Folder, label: "Templates", shortcut: "⌘T", path: "/templates" },
      { icon: UsersIcon, label: "Teams", shortcut: "⌘M", path: "/teams" },
      { icon: FileStack, label: "Audit Trail", shortcut: "⌘L", path: "/audit" },
      { icon: Plug2Icon, label: "Integrations", shortcut: "⌘I", path: "/integrations" },
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
      { icon: Keyboard, label: "Keyboard Shortcuts", shortcut: "⌘A", path: "/keyboard" },
    ],
  },
];

export function SiteHeader() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
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
      if (e.key === "a" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push("/keyboard");
      }
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
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
              <CommandShortcut>⌘H</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/documents"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Documents</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/drafts"))}>
              <Brain className="mr-2 h-4 w-4" />
              <span>AI Drafts</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/compliance"))}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              <span>Compliance</span>
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/templates"))}>
              <Folder className="mr-2 h-4 w-4" />
              <span>Templates</span>
              <CommandShortcut>⌘T</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/teams"))}>
              <UsersIcon className="mr-2 h-4 w-4" />
              <span>Teams</span>
              <CommandShortcut>⌘M</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/audit"))}>
              <FileStack className="mr-2 h-4 w-4" />
              <span>Audit Trail</span>
              <CommandShortcut>⌘L</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/integrations"))}>
              <Plug2Icon className="mr-2 h-4 w-4" />
              <span>Integrations</span>
              <CommandShortcut>⌘I</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => runCommand(() => router.push("/create"))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create Document</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => router.push("/account"))}>
              <User className="mr-2 h-4 w-4" />
              <span>Account</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/keyboard"))}>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard Shortcuts</span>
              <CommandShortcut>⌘A</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-14 w-full items-center px-4 gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <SidebarTrigger className="h-9 w-9 mr-1.5" />
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Largence Logo" 
              width={28} 
              height={28}
              className="shrink-0"
            />
            <span className="text-xl font-semibold tracking-tight font-(family-name:--font-general-sans)">
              Largence
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center gap-2 max-w-2xl mx-auto">
          <button
            onClick={() => setCommandOpen(true)}
            className="w-full max-w-md h-9 px-3 rounded-sm border bg-background hover:bg-accent transition-colors flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span>Search or enter a Command</span>
            <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
          <Button
            variant="default"
            size="sm"
            className="h-9 rounded-sm gap-2 shrink-0"
            onClick={() => router.push("/create")}
          >
            <span className="hidden sm:inline">Create</span>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-sm relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary"></span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0">
              <SheetHeader className="border-b px-6 py-4">
                <SheetTitle className="text-lg font-semibold">Notifications</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  Stay updated with your latest activity
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex flex-col h-[calc(100vh-5rem)] overflow-y-auto">
                {/* Notification Items */}
                <div className="divide-y">
                  {/* New Notification */}
                  <div className="p-4 hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">
                            New document ready for review
                          </p>
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5"></span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Employment Agreement v2.3 has been generated and is awaiting your approval.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>2 minutes ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Alert */}
                  <div className="p-4 hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-amber-500/10">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">
                            Compliance check required
                          </p>
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5"></span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          3 documents need compliance verification before the end of the quarter.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>1 hour ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team Mention */}
                  <div className="p-4 hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                        <UsersIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">
                            You were mentioned in Legal Team
                          </p>
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5"></span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Sarah Johnson mentioned you in a comment on NDA Template Review.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>3 hours ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Completed - Read */}
                  <div className="p-4 hover:bg-accent transition-colors cursor-pointer opacity-60">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-green-500/10">
                        <CheckCheck className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-tight">
                          Document approved successfully
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Service Agreement #2845 has been approved by all stakeholders.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Yesterday</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Integration Sync */}
                  <div className="p-4 hover:bg-accent transition-colors cursor-pointer opacity-60">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                        <Plug2Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-tight">
                          Google Drive sync completed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          24 documents successfully synced to your Google Drive workspace.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>2 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Template Update */}
                  <div className="p-4 hover:bg-accent transition-colors cursor-pointer opacity-60">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                        <Folder className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-tight">
                          New template added to library
                        </p>
                        <p className="text-xs text-muted-foreground">
                          GDPR Data Processing Agreement template is now available.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>3 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t p-4 mt-auto bg-background">
                  <Button variant="outline" className="w-full h-10 rounded-sm" onClick={() => setNotificationOpen(false)}>
                    Mark all as read
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-sm">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push("/account?tab=profile")}
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
                            <span className="text-xs text-muted-foreground">Bright and clear</span>
                          </div>
                        </div>
                        {theme === "light" && <Check className="h-4 w-4 ml-2 text-primary" />}
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
                            <span className="text-xs text-muted-foreground">Easy on the eyes</span>
                          </div>
                        </div>
                        {theme === "dark" && <Check className="h-4 w-4 ml-2 text-primary" />}
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
                            <span className="text-sm font-medium">System</span>
                            <span className="text-xs text-muted-foreground">Follows device</span>
                          </div>
                        </div>
                        {theme === "system" && <Check className="h-4 w-4 ml-2 text-primary" />}
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push("/account?tab=language")}
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
                  onClick={() => router.push("/account?tab=privacy")}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Privacy & Security</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push("/account?tab=billing")}
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
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-sm">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push("/account?tab=profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push("/account?tab=preferences")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push("/account?tab=billing")}
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
    </>
  );
}

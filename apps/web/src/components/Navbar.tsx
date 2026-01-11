"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@largence/ui";
import { Menu, X, User, LogOut, LayoutDashboard, HomeIcon } from "lucide-react";
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/nextjs";
import { ScheduleDemoDialog } from "./schedule-demo-dialog";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("");
  const [demoDialogOpen, setDemoDialogOpen] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = menuItems.map((item) => item.href.substring(1));
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const menuItems = [
    { href: "#features", label: "Features" },
    { href: "/templates", label: "Templates", isPage: true },
    { href: "#pricing", label: "Pricing" },
  ];

  // Handle link clicks - redirect to home page with hash if not on home
  const handleLinkClick = (e: React.MouseEvent, item: typeof menuItems[0]) => {
    setMobileMenuOpen(false);
    
    // If it's a page link, let normal navigation happen
    if ((item as any).isPage) return;
    
    // If it's a hash link and we're not on the home page, navigate to home with hash
    if (item.href.startsWith("#") && pathname !== "/") {
      e.preventDefault();
      window.location.href = `/${item.href}`;
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 py-2 px-4 touch-manipulation">
        <div
          className={`max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-500 ease-in-out rounded-xl ${
            scrolled
              ? "rounded-xl bg-background/80 backdrop-blur-md border"
              : ""
          }`}
        >
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group z-50 shrink-0"
            >
              <Image
                src="/logo.png"
                alt="Largence Logo"
                width={28}
                height={28}
                className="shrink-0 sm:w-7 sm:h-7"
              />
              <span className="text-base sm:text-lg font-semibold font-heading tracking-tight group-hover:text-primary transition-colors duration-200">
                Largence
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2 ml-8 lg:ml-10 mt-0.5">
              {menuItems.map((item) => {
                const isActive = (item as any).isPage 
                  ? pathname === item.href 
                  : activeSection === item.href.substring(1);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors duration-200 relative group px-2.5 py-1.5 rounded-md ${
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    onClick={(e) => handleLinkClick(e, item)}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 ml-auto">
              <SignedOut>
                <Link href="https://app.largence.com/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium rounded-sm transition-all duration-200 cursor-pointer text-sm"
                  >
                    Sign In
                  </Button>
                </Link>
                <Button
                  onClick={() => setDemoDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="font-medium rounded-sm transition-all duration-200 border-border/50 cursor-pointer text-sm"
                >
                  Book Demo
                </Button>
                <Link href="https://app.largence.com/auth/signup">
                  <Button
                    variant="default"
                    size="sm"
                    className="font-medium rounded-sm transition-all duration-200 cursor-pointer text-sm"
                  >
                    Get Started
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    {!isLoaded ? (
                      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    ) : user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </button>
                  {profileMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setProfileMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-background border rounded-md shadow-lg z-50">
                        <div className="px-3 py-2 border-b">
                          <p className="text-sm font-medium truncate">{user?.fullName || user?.emailAddresses?.[0]?.emailAddress}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
                        </div>
                        <Link
                          href="https://app.largence.com"
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <HomeIcon className="h-4 w-4" />
                          Go to Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            signOut();
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </SignedIn>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative z-50 p-1.5 text-foreground hover:text-primary transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/95 backdrop-blur-xl"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Content */}
        <div
          className={`relative h-full flex flex-col pt-20 px-6 transform transition-all duration-300 ${
            mobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0"
          }`}
        >
          {/* Navigation Links */}
          <div className="flex flex-col space-y-1 mb-8">
            {menuItems.map((item, index) => {
              const isActive = (item as any).isPage 
                ? pathname === item.href 
                : activeSection === item.href.substring(1);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-base font-heading font-semibold transition-all duration-200 py-2 transform ${
                    isActive
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  } ${
                    mobileMenuOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-4 opacity-0"
                  }`}
                  style={{
                    transitionDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms",
                  }}
                  onClick={(e) => handleLinkClick(e, item)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Actions */}
          <div
            className={`flex flex-col gap-3 transform transition-all duration-300 ${
              mobileMenuOpen
                ? "translate-x-0 opacity-100"
                : "-translate-x-4 opacity-0"
            }`}
            style={{
              transitionDelay: mobileMenuOpen
                ? `${menuItems.length * 50}ms`
                : "0ms",
            }}
          >
            <SignedOut>
              <Link
                href="https://app.largence.com/login"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="outline" size="lg" className="w-full rounded-sm">
                  Sign in
                </Button>
              </Link>
              <Link
                href="https://app.largence.com/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="default" size="lg" className="w-full rounded-sm">
                  Get Started
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="https://app.largence.com"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="default" size="lg" className="w-full rounded-sm">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-sm text-destructive"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </SignedIn>
          </div>

          {/* Footer Info */}
          <div
            className={`mt-auto pb-8 text-center text-sm text-muted-foreground transform transition-all duration-300 ${
              mobileMenuOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
            style={{
              transitionDelay: mobileMenuOpen
                ? `${(menuItems.length + 1) * 50}ms`
                : "0ms",
            }}
          >
            <p>© {new Date().getFullYear()} Largence</p>
            <p className="text-xs mt-1">
              Legal Intelligence for Enterprises
            </p>
          </div>
        </div>
      </div>

      <ScheduleDemoDialog
        open={demoDialogOpen}
        onOpenChange={setDemoDialogOpen}
      />
    </>
  );
};

"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@largence/ui";
import { Menu, X } from "lucide-react";
import { ScheduleDemoDialog } from "./schedule-demo-dialog";

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("");
  const [demoDialogOpen, setDemoDialogOpen] = React.useState(false);

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
    { href: "#pricing", label: "Pricing" },
  ];

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
                const isActive = activeSection === item.href.substring(1);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors duration-200 relative group px-2.5 py-1.5 rounded-md ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
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
              const isActive = activeSection === item.href.substring(1);
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
                  onClick={() => setMobileMenuOpen(false)}
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

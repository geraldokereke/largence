"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@largence/ui";
import { Cookie } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="max-w-6xl mx-auto bg-background border border-border rounded-xl shadow-2xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
            <Cookie className="w-6 h-6 md:w-8 md:h-8 text-primary shrink-0" />
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-base md:text-lg mb-1 md:mb-2">
                We use cookies
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use cookies to enhance your browsing experience, analyze site
                traffic, and personalize content. By clicking "Accept", you
                consent to our use of cookies.
                <Link
                  href="#privacy"
                  className="text-primary hover:underline ml-1 cursor-pointer"
                >
                  Learn more
                </Link>
              </p>
            </div>
            <div className="flex gap-2 md:gap-3 shrink-0 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={declineCookies}
                className="cursor-pointer flex-1 md:flex-initial"
              >
                Decline
              </Button>
              <Button
                onClick={acceptCookies}
                className="cursor-pointer flex-1 md:flex-initial"
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

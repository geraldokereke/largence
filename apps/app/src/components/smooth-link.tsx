"use client";

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, MouseEvent } from "react";
import { cn } from "@largence/lib/utils";

interface SmoothLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * SmoothLink - A drop-in replacement for Next.js Link with smooth page transitions
 *
 * Uses the View Transitions API when available for native browser transitions
 * Falls back to standard Next.js navigation on unsupported browsers
 * Automatically prefetches routes for instant navigation
 */
export function SmoothLink({
  href,
  children,
  className,
  onClick,
  ...props
}: SmoothLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Only prevent default for internal navigation
    if (
      !e.defaultPrevented &&
      typeof href === "string" &&
      href.startsWith("/")
    ) {
      e.preventDefault();

      // Use View Transitions API if available
      if (
        "startViewTransition" in document &&
        typeof (document as any).startViewTransition === "function"
      ) {
        (document as any).startViewTransition(() => {
          router.push(href);
        });
      } else {
        router.push(href);
      }
    }
  };

  return (
    <Link
      href={href}
      className={cn(className)}
      onClick={handleClick}
      prefetch={true}
      {...props}
    >
      {children}
    </Link>
  );
}

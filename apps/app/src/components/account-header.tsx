"use client";

import Link from "next/link";
import Image from "next/image";

export function AccountHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Image
            src="/logo.png"
            alt="Largence Logo"
            width={28}
            height={28}
            className="shrink-0"
          />
          <span className="text-xl font-semibold tracking-tight font-heading">
            Largence
          </span>
        </Link>
      </div>
    </header>
  );
}

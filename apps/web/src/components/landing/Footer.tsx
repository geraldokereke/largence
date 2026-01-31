import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 md:py-12 px-4 sm:px-6 bg-muted/20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 rounded-xl border border-border/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="Largence Logo"
                width={28}
                height={28}
                className="shrink-0"
              />
              <span className="font-heading text-lg font-semibold">
                Largence
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Legal Intelligence for Enterprises
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <Link
                href="https://x.com/largencehq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Follow us on X"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="https://instagram.com/largencehq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Follow us on Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              <Link
                href="https://linkedin.com/company/largence"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#features"
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="https://app.largence.com/templates"
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Templates
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://www.producthunt.com/posts/largence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Product Hunt
                </Link>
              </li>
              <li>
                <Link
                  href="https://youtu.be/nBBQerezyF4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Video Walkthrough
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:support@largence.com"
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} Largence. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span>
              A product of{" "}
              <Link
                href="https://heuvera.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Heuvera
              </Link>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://www.producthunt.com/posts/largence"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-orange-500 transition-colors flex items-center gap-1.5 text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 40 40" fill="currentColor">
                <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="currentColor"/>
                <path d="M22.667 20H17.334V14.667H22.667C24.14 14.667 25.334 15.86 25.334 17.333C25.334 18.807 24.14 20 22.667 20ZM22.667 10.667H13.334V30H17.334V24H22.667C26.347 24 29.334 21.013 29.334 17.333C29.334 13.653 26.347 10.667 22.667 10.667Z" fill="white"/>
              </svg>
              Product Hunt
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

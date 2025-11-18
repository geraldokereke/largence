import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 md:py-12 px-4 sm:px-6 bg-muted/20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 md:py-8 rounded-xl border border-border/30">
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
              <span className="font-heading text-lg font-semibold">Largence</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enterprise Legal Intelligence for Africa
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors cursor-pointer">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-foreground transition-colors cursor-pointer">Pricing</Link></li>
              <li><Link href="#security" className="hover:text-foreground transition-colors cursor-pointer">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="#about" className="hover:text-foreground transition-colors cursor-pointer">About</Link></li>
              <li><Link href="#blog" className="hover:text-foreground transition-colors cursor-pointer">Blog</Link></li>
              <li><Link href="#careers" className="hover:text-foreground transition-colors cursor-pointer">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="#privacy" className="hover:text-foreground transition-colors cursor-pointer">Privacy</Link></li>
              <li><Link href="#terms" className="hover:text-foreground transition-colors cursor-pointer">Terms</Link></li>
              <li><Link href="#compliance" className="hover:text-foreground transition-colors cursor-pointer">Compliance</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Largence. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

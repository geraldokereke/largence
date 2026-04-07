import Image from "next/image";

const supporters = [
  {
    name: "Anglia Ruskin Enterprise Academy",
    logo: "/supporters/Anglia Ruskin Enterprise Academy Logo.jpeg",
  },
  {
    name: "LawTechUK",
    logo: "/supporters/lawTech.png",
  },
  {
    name: "Responsible AI Governance Initiative",
    logo: "/supporters/responsible ai governance initiative.png",
  },
  {
    name: "Shift+",
    logo: "/supporters/shift+.jpeg",
  },
  {
    name: "Syrilla Healthcare Helping Hands Foundation",
    logo: "/supporters/syrilla healthcare helping hands foundation.jpeg",
  },
];

export function AuthMarketingPanel({ grainId = "auth-grain" }: { grainId?: string }) {
  return (
    <div className="hidden lg:flex bg-muted relative overflow-hidden">
      {/* SVG noise grain texture */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.35] mix-blend-multiply dark:mix-blend-soft-light" aria-hidden="true">
        <filter id={grainId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10" />

      {/* Decorative glow */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        {/* Top - Typographic statement */}
        <div className="flex-1 flex flex-col justify-center max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 w-fit">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Built for legal teams
          </div>

          <h2 className="font-display text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
            Legal intelligence,
            <br />
            <span className="text-primary">simplified</span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-sm">
            Draft, manage, and automate legal documents with AI-powered
            intelligence. Built for teams who need compliance without
            complexity.
          </p>
        </div>

        {/* Bottom - Supported by */}
        <div className="pt-10 border-t border-border/40">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium mb-6">
            Supported By
          </p>
          <div className="flex items-center gap-6 flex-wrap">
            {supporters.map((supporter) => (
              <div
                key={supporter.name}
                className="relative w-12 h-12 rounded-lg bg-background/60 border border-border/40 flex items-center justify-center overflow-hidden grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                title={supporter.name}
              >
                <Image
                  src={supporter.logo}
                  alt={supporter.name}
                  fill
                  className="object-contain p-1.5"
                  sizes="48px"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

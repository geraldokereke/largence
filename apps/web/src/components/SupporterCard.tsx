import Image from "next/image";

export const supporters = [
    {
        name: "Anglia Ruskin Enterprise Academy",
        logo: "/Anglia Ruskin Enterprise Academy Logo.jpeg",
    },
    {
        name: "LawTech",
        logo: "/lawTech.png",
    },
    {
        name: "Responsible AI Governance Initiative",
        logo: "/responsible ai governance initiative.png",
    },
    {
        name: "Shift+",
        logo: "/shift+.jpeg",
    },
    {
        name: "Syrilla Healthcare Helping Hands Foundation",
        logo: "/syrilla healthcare helping hands foundation.jpeg",
    },
];

export default function SupporterCard({ supporter }: { supporter: (typeof supporters)[0] }) {
    
    return (
        <div className="group flex flex-col items-center gap-4 shrink-0 px-6 md:px-10">
            {/* Logo Container */}
            <div className="relative w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center overflow-hidden transition-all duration-500 ease-out grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:border-primary/30 group-hover:bg-card group-hover:shadow-xl group-hover:shadow-primary/[0.06] group-hover:-translate-y-1">
                <Image
                    src={supporter.logo}
                    alt={`${supporter.name} logo`}
                    fill
                    className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100px, 120px"
                />
            </div>

            {/* Name */}
            <p className="text-xs text-center text-muted-foreground/60 font-medium leading-tight max-w-[140px] transition-all duration-500 group-hover:text-foreground">
                {supporter.name}
            </p>
        </div>
    );
}

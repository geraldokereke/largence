"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Mic, ArrowRight, User, Users, Megaphone, 
  Headphones, FileText, ChevronRight, LayoutGrid, List, 
  Sparkles, BookOpen, Globe, Gavel, FileCheck, Shield, 
  Briefcase, Building2, Scale, ChevronDown, ChevronUp, 
  Sliders,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Grouped Categories Dummy Data
const categoryGroups = [
  {
    id: "jurisdiction",
    label: "Jurisdictions",
    icon: Globe,
    items: [
      { id: "all", label: "Global", icon: Globe },
      { id: "us", label: "United States (US)", icon: Search },
      { id: "uk", label: "United Kingdom (UK)", icon: Sparkles },
      { id: "eu", label: "European Union (EU)", icon: Users },
      { id: "africa", label: "Africa (AU)", icon: FileText },
    ]
  },
  {
    id: "doc-types",
    label: "Document Types",
    icon: FileCheck,
    items: [
      { id: "employment", label: "Employment", icon: Briefcase },
      { id: "corporate", label: "Corporate", icon: Building2 },
      { id: "business", label: "Business", icon: Scale },
      { id: "policy", label: "Policy & Privacy", icon: Shield },
    ]
  },
  {
    id: "legal-topics",
    label: "Legal Topics",
    icon: Gavel,
    items: [
      { id: "compliance", label: "Compliance", icon: Shield },
      { id: "intellectual-property", label: "Intellectual Property", icon: FileText },
      { id: "dispute-resolution", label: "Dispute Resolution", icon: Gavel },
    ]
  }
];

const recommendedGrid = [
  {
    title: "Keep IT inbox clear of recurring system alerts",
    apps: ["Gmail", "Slack"],
    more: "+2",
  },
  {
    title: "Generate consistent email drafts from webhook events for IT",
    apps: ["Gmail", "Slack"],
    more: "+2",
  },
  {
    title: "Keep incident email replies in one thread",
    apps: ["Gmail", "Outlook"],
    more: "",
  },
];

const discordGrid = [
  {
    title: "Keep daily micro workouts on schedule with quick prompts",
    apps: ["Slack", "Discord"],
    more: "+2",
  },
  {
    title: "Notify marketing and ops about ad platform outages promptly",
    apps: ["Discord", "Slack"],
    more: "+3",
  },
  {
    title: "Publish timely token launch alerts to all channels",
    apps: ["Sheets", "Slack"],
    more: "",
  },
];

// Dummy data for list (Google Scholar style)
const scholarList = [
  {
    title: "The impact of artificial intelligence on modern software engineering",
    authors: "Smith J, Doe A - Journal of Software Engineering, 2023 - publisher.com",
    snippet: "This paper explores how large language models and other artificial intelligence agents are transforming the landscape of modern software development. We examine key metrics such as deployment velocity and code quality improvements across multiple cross-functional teams.",
    citations: "Cited by 142",
    related: "Related articles",
    versions: "All 4 versions",
  },
  {
    title: "Automating repetitive tasks with autonomous agents",
    authors: "Johnson B, Roberts M - Conference on AI, 2022 - aiconf.org",
    snippet: "Repetitive tasks in IT and customer support can be effectively delegated to autonomous agents powered by large language models, resulting in increased efficiency and lower operational costs. The study highlights several case studies.",
    citations: "Cited by 89",
    related: "Related articles",
    versions: "All 2 versions",
  },
  {
    title: "A comparative study of email automation workflows",
    authors: "Williams C - Automation Quarterly, 2024 - autoquarterly.com",
    snippet: "We compare various workflow automation platforms in terms of their ability to parse, classify, and draft responses to incoming support emails. The results indicate significant variances in accuracy based on the underlying transformer architecture.",
    citations: "Cited by 12",
    related: "Related articles",
    versions: "All 3 versions",
  },
];

function CollapsibleCategory({ 
  group, 
  activeCategory, 
  setActiveCategory 
}: { 
  group: any; 
  activeCategory: string; 
  setActiveCategory: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = group.icon;
  
  const hasActiveItem = group.items.some((item: any) => item.id === activeCategory);

  return (
    <div className="flex flex-col mb-1 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-2.5 py-2 rounded-sm text-[11px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted/40 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-muted-foreground/70" />
          <span>{group.label}</span>
        </div>
        <ChevronDown 
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 mt-0.5 ml-1 border-l border-border/50 pl-1">
              {group.items.map((item: any) => {
                const ItemIcon = item.icon;
                const isActive = activeCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveCategory(item.id)}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm transition-all text-sm font-medium ${
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <ItemIcon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Research() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [prompt, setPrompt] = useState("");

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 mb-4">
      {/* Header section */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold tracking-tight font-display mb-1">
          Research
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter an idea, topic, or document name to get intelligent insights and automated research.
        </p>
      </div>

      {/* Prompt Box */}
      <div className="rounded-sm border bg-card shadow-sm p-4 w-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Largence Research</span>
          <span className="inline-flex items-center rounded-sm border bg-muted/30 px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider text-muted-foreground ml-1.5">
            BETA
          </span>
        </div>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., How does AI impact modern software engineering?"
          className="w-full resize-none min-h-[60px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60 scrollbar-hide py-1 mt-1"
          rows={2}
          autoFocus
        />
        <div className="flex items-center justify-between mt-2 pt-3 border-t">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground rounded-sm border-dashed">
              <Plus className="w-3 h-3" /> Context
            </Button>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-sm hover:bg-muted">
               <Mic className="w-4 h-4" />
             </Button>
             <Button className="h-8 px-4 rounded-sm font-medium text-xs shadow-sm group">
               Search 
               <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar - Categories */}
        <div className="w-full md:w-56 shrink-0 flex flex-col">
          <div className="rounded-sm border bg-card p-1.5 shadow-sm flex flex-col gap-1">
            <div className="px-2.5 py-2 mb-1 border-b border-border/40">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <SlidersHorizontal className="w-3 h-3" />
                Filters
              </h3>
            </div>
            {categoryGroups.map((group) => (
              <CollapsibleCategory 
                key={group.id} 
                group={group} 
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
              />
            ))}
          </div>
        </div>

        {/* Right Content - Results */}
        <div className="flex-1 flex flex-col min-w-0 pb-8">
          
          {/* Header & Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
             <div>
               <h2 className="text-lg font-semibold text-foreground tracking-tight">Results</h2>
               <p className="text-xs text-muted-foreground mt-0.5">Showing ~3,420 found results (0.04 sec)</p>
             </div>
             
             {/* View Toggle */}
             <div className="flex items-center bg-muted/40 p-1 rounded-sm border shadow-sm">
                <Button 
                  variant={viewMode === "grid" ? "default" : "ghost"} 
                  size="sm" 
                  className={`h-7 px-3 rounded-sm text-xs font-medium transition-colors ${viewMode === "grid" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
                  Grid
                </Button>
                <Button 
                  variant={viewMode === "list" ? "default" : "ghost"} 
                  size="sm" 
                  className={`h-7 px-3 rounded-sm text-xs font-medium transition-colors ${viewMode === "list" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-3.5 h-3.5 mr-1.5" />
                  List
                </Button>
             </div>
          </div>

          {/* Results Render */}
          {viewMode === "grid" ? (
            <div className="flex flex-col gap-8">
              {/* Recommended Section */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Recommended for you
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {recommendedGrid.map((item, i) => (
                    <div key={i} className="group flex flex-col p-4 rounded-sm border bg-card hover:border-primary/40 transition-all duration-200 cursor-pointer hover:shadow-sm relative h-full">
                      <div className="mb-6 mr-6">
                        <p className="text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                      </div>
                      <div className="mt-auto pt-3 border-t border-border/40">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Integrations</p>
                        <div className="flex items-center flex-wrap gap-1.5">
                          {item.apps.map((app, j) => (
                            <div key={j} className="flex items-center bg-muted px-2 py-0.5 rounded-sm text-[11px] font-medium text-foreground border border-transparent">
                              {app}
                            </div>
                          ))}
                          {item.more && (
                            <div className="flex items-center text-muted-foreground px-2 py-0.5 rounded-sm text-[11px] font-medium border border-border/60">
                              {item.more}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute right-4 top-4 w-6 h-6 rounded-sm bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-primary">
                         <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discord Section */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Works well with Discord
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {discordGrid.map((item, i) => (
                    <div key={i} className="group flex flex-col p-4 rounded-sm border bg-card hover:border-indigo-500/40 transition-all duration-200 cursor-pointer hover:shadow-sm relative h-full">
                      <div className="mb-6 mr-6">
                        <p className="text-sm font-medium leading-snug text-foreground group-hover:text-indigo-500 transition-colors">
                          {item.title}
                        </p>
                      </div>
                      <div className="mt-auto pt-3 border-t border-border/40">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Integrations</p>
                        <div className="flex items-center flex-wrap gap-1.5">
                          {item.apps.map((app, j) => (
                            <div key={j} className="flex items-center bg-muted px-2 py-0.5 rounded-sm text-[11px] font-medium text-foreground border border-transparent">
                              {app}
                            </div>
                          ))}
                          {item.more && (
                            <div className="flex items-center text-muted-foreground px-2 py-0.5 rounded-sm text-[11px] font-medium border border-border/60">
                              {item.more}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute right-4 top-4 w-6 h-6 rounded-sm bg-indigo-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-indigo-500">
                         <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {scholarList.map((item, i) => (
                <div key={i} className="flex flex-col p-4 rounded-sm border bg-card transition-all hover:bg-muted/30 hover:border-border/80 relative group">
                  <a href="#" className="inline-block w-fit mb-1.5">
                    <h3 className="text-base leading-snug text-primary font-semibold group-hover:underline underline-offset-2">
                      {item.title}
                    </h3>
                  </a>
                  <div className="text-xs text-emerald-600 dark:text-emerald-500 font-medium tracking-tight mb-2">
                    {item.authors}
                  </div>
                  <div className="text-sm text-foreground/80 leading-relaxed max-w-4xl line-clamp-3">
                    {item.snippet}
                  </div>
                  <div className="flex items-center flex-wrap gap-4 mt-3 pt-3 border-t border-border/40 text-[11px] font-medium">
                    <a href="#" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-[4px]">
                      <FileText className="w-3 h-3" /> {item.citations}
                    </a>
                    <a href="#" className="hover:underline hover:text-primary transition-colors text-muted-foreground">
                      {item.related}
                    </a>
                    <a href="#" className="hover:underline hover:text-primary transition-colors text-muted-foreground">
                      {item.versions}
                    </a>
                    <a href="#" className="flex items-center gap-1.5 hover:text-foreground text-muted-foreground transition-colors ml-auto mr-1">
                      Save
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
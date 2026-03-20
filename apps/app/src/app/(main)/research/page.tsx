"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowRight,
  FileText,
  ChevronRight,
  LayoutGrid,
  List,
  Sparkles,
  BookOpen,
  Globe,
  Gavel,
  FileCheck,
  Shield,
  Briefcase,
  Building2,
  Scale,
  ChevronDown,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  ExternalLink,
  BookMarked,
  ScrollText,
  FileSearch,
  Landmark,
  LibraryBig,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Static config ────────────────────────────────────────────────────────────

const categoryGroups = [
  {
    id: "jurisdiction",
    label: "Jurisdictions",
    icon: Globe,
    items: [
      { id: "all", label: "Global", icon: Globe },
      { id: "us", label: "United States", icon: Landmark },
      { id: "uk", label: "United Kingdom", icon: Landmark },
      { id: "eu", label: "European Union", icon: Landmark },
      { id: "canada", label: "Canada", icon: Landmark },
      { id: "australia", label: "Australia / NZ", icon: Landmark },
      { id: "africa", label: "Africa", icon: Landmark },
      { id: "asia", label: "Asia", icon: Landmark },
      { id: "latam", label: "Latin America", icon: Landmark },
      { id: "international", label: "International", icon: Globe },
      { id: "academic", label: "Academic", icon: LibraryBig },
    ],
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
    ],
  },
  {
    id: "legal-topics",
    label: "Legal Topics",
    icon: Gavel,
    items: [
      { id: "compliance", label: "Compliance", icon: Shield },
      { id: "intellectual-property", label: "Intellectual Property", icon: FileText },
      { id: "dispute-resolution", label: "Dispute Resolution", icon: Gavel },
      { id: "human-rights", label: "Human Rights", icon: Scale },
      { id: "commercial", label: "Commercial Law", icon: Briefcase },
    ],
  },
];

const SUGGESTED_QUERIES = [
  "Landmark cases on freedom of speech in the United States",
  "EU GDPR enforcement actions and data privacy precedents",
  "Wrongful termination precedents in employment law UK",
  "International arbitration rules and enforcement mechanisms",
  "Constitutional rights in Africa — recent Supreme Court cases",
  "Software patent eligibility after Alice Corp v. CLS Bank",
];

const TYPE_ICON: Record<string, React.ElementType> = {
  case: Gavel,
  statute: ScrollText,
  regulation: FileCheck,
  article: BookOpen,
  treaty: Globe,
  other: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  case: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  statute: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  regulation: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  article: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  treaty: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  other: "bg-muted text-muted-foreground",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CollapsibleCategory({
  group,
  activeCategory,
  setActiveCategory,
}: {
  group: (typeof categoryGroups)[number];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = group.icon;

  return (
    <div className="flex flex-col mb-1 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-2.5 py-2 rounded-sm text-[11px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-muted-foreground/70" />
          <span>{group.label}</span>
        </div>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
              {group.items.map((item) => {
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
                    <ItemIcon
                      className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted-foreground/60"}`}
                    />
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

function ResultCard({ item }: { item: any }) {
  const Icon = TYPE_ICON[item.type] ?? FileText;
  const colorClass = TYPE_COLORS[item.type] ?? TYPE_COLORS.other;

  return (
    <div className="flex flex-col p-4 rounded-sm border bg-card transition-all hover:bg-muted/20 hover:border-border/80 group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide ${colorClass}`}>
              <Icon className="w-2.5 h-2.5" />
              {item.type}
            </span>
            {item.jurisdiction && (
              <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-sm">
                {item.jurisdiction}
              </span>
            )}
            {item.date && (
              <span className="text-[10px] text-muted-foreground">{item.date}</span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </h3>
        </div>
        {item.sourceUrl && item.sourceUrl !== "#" && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 mt-0.5 text-muted-foreground/50 hover:text-primary transition-colors"
            title={`Open in ${item.source}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {item.snippet && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
          {item.snippet}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground/70">{item.source}</span>
        {item.citation && (
          <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded-sm">
            {item.citation}
          </span>
        )}
      </div>
    </div>
  );
}

function ResultRow({ item }: { item: any }) {
  const Icon = TYPE_ICON[item.type] ?? FileText;
  const colorClass = TYPE_COLORS[item.type] ?? TYPE_COLORS.other;

  return (
    <div className="flex flex-col p-4 rounded-sm border bg-card transition-all hover:bg-muted/20 hover:border-border/80 group">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide ${colorClass}`}>
          <Icon className="w-2.5 h-2.5" />
          {item.type}
        </span>
        {item.jurisdiction && (
          <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-sm">
            {item.jurisdiction}
          </span>
        )}
        {item.date && (
          <span className="text-[10px] text-muted-foreground">{item.date}</span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors mb-1.5">
            {item.title}
          </h3>
          {item.snippet && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {item.snippet}
            </p>
          )}
        </div>
        {item.sourceUrl && item.sourceUrl !== "#" && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 mt-0.5 text-muted-foreground/50 hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground/70">{item.source}</span>
        {item.citation && (
          <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded-sm">
            {item.citation}
          </span>
        )}
        {item.sourceUrl && item.sourceUrl !== "#" && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-primary hover:underline"
          >
            View source <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Research() {
  const [jurisdiction, setJurisdiction] = useState("all");
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);

  function toggleDocType(id: string) {
    setSelectedDocTypes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleTopic(id: string) {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  // Sync sidebar selections with state
  function handleCategorySelect(id: string) {
    // Check which group this id belongs to
    const jurisdictionItem = categoryGroups[0].items.find((i) => i.id === id);
    if (jurisdictionItem) { setJurisdiction(id); return; }

    const docTypeItem = categoryGroups[1].items.find((i) => i.id === id);
    if (docTypeItem) { toggleDocType(id); return; }

    const topicItem = categoryGroups[2].items.find((i) => i.id === id);
    if (topicItem) { toggleTopic(id); return; }
  }

  // Determine which category button looks "active" for sidebar rendering
  function getActiveCategory() {
    return jurisdiction;
  }

  async function handleSearch(overrideQuery?: string) {
    const q = (overrideQuery ?? query).trim();
    if (!q) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          jurisdiction,
          docTypes: selectedDocTypes,
          legalTopics: selectedTopics,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Research failed.");
      setResults(data);
      if (overrideQuery) setQuery(overrideQuery);
    } catch (err: any) {
      setError(err.message ?? "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 mb-4">
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold tracking-tight font-display mb-1">
          Legal Research
        </h1>
        <p className="text-sm text-muted-foreground">
          Search authoritative legal databases worldwide — cases, statutes, regulations, treaties, and academic sources.
        </p>
      </div>

      {/* Search Box */}
      <div className="rounded-sm border bg-card shadow-sm p-4 w-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Largence Research</span>
          <span className="inline-flex items-center rounded-sm border bg-muted/30 px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider text-muted-foreground ml-1.5">
            AI-Powered
          </span>
        </div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="E.g., Landmark cases on wrongful termination in Nigeria…"
          className="w-full resize-none min-h-16 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60 scrollbar-hide py-1 mt-1"
          rows={2}
          autoFocus
          disabled={isLoading}
        />
        <div className="flex items-center justify-between mt-2 pt-3 border-t">
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Press <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px]">Enter</kbd> to search · <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px]">Shift+Enter</kbd> for new line
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="h-8 px-4 rounded-sm font-medium text-xs shadow-sm group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Researching…
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5 mr-1.5" />
                  Search
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
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
                activeCategory={getActiveCategory()}
                setActiveCategory={handleCategorySelect}
              />
            ))}
          </div>
        </div>

        {/* Results area */}
        <div className="flex-1 flex flex-col min-w-0 pb-8">
          {/* Empty state */}
          {!isLoading && !results && !error && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center mb-4">
                  <FileSearch className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground mb-1">
                  Start your legal research
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Search across global legal databases — CourtListener, EUR-Lex, BAILII, AfricanLII, AustLII, and more.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-0.5">
                  Suggested searches
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTED_QUERIES.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(sq)}
                      className="group flex items-start gap-3 p-3 rounded-sm border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                    >
                      <BookMarked className="w-3.5 h-3.5 mt-0.5 text-muted-foreground/60 shrink-0 group-hover:text-primary transition-colors" />
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
                        {sq}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-sm bg-primary/10 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Searching legal databases…</p>
                <p className="text-xs text-muted-foreground">This may take 10–20 seconds</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Research failed</p>
                <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-sm text-xs mt-1" onClick={() => handleSearch()}>
                Try again
              </Button>
            </div>
          )}

          {/* Results */}
          {results && !isLoading && (
            <div className="flex flex-col gap-5">
              {/* Result header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground tracking-tight">
                    Results
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {results.results.length} source{results.results.length !== 1 ? "s" : ""} found
                    {results.searchedSources?.length
                      ? ` · searched ${results.searchedSources.length} databases`
                      : ""}
                  </p>
                </div>
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

              {/* AI Summary */}
              {results.summary && (
                <div className="rounded-sm border border-primary/20 bg-primary/5 p-4 flex gap-3">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1.5">
                      AI Research Summary
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {results.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Sources searched */}
              {results.searchedSources?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Sources:
                  </span>
                  {results.searchedSources.slice(0, 8).map((s: string) => (
                    <span
                      key={s}
                      className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-sm border border-border/50"
                    >
                      {s}
                    </span>
                  ))}
                  {results.searchedSources.length > 8 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{results.searchedSources.length - 8} more
                    </span>
                  )}
                </div>
              )}

              {/* Result cards */}
              {results.results.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  No specific results found. Try refining your query.
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {results.results.map((item: any) => (
                    <ResultCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {results.results.map((item: any) => (
                    <ResultRow key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

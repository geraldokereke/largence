"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@largence/components/ui/button";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  FileSearch,
  FileText,
  GitCompareArrows,
  Loader2,
  ScrollText,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  status: string;
}

interface MatterContext {
  matterId?: string;
  matterName?: string;
  clientName?: string;
  matterType?: string;
  practiceArea?: string;
  jurisdiction?: string;
}

interface Defect {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  title: string;
  description: string;
  sourceDocument: string;
  recommendation: string;
}

interface KeyClause {
  id: string;
  type: string;
  content: string;
  sourceDocument: string;
  significance: string;
}

interface Inconsistency {
  id: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  documentsInvolved: string[];
  implication: string;
}

interface UrgentIssue {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  recommendedAction: string;
}

interface BundleAnalysis {
  seniorSummary: string;
  overallRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  defects: Defect[];
  keyClauses: KeyClause[];
  inconsistencies: Inconsistency[];
  urgentIssues: UrgentIssue[];
  confidenceScore: number;
}

const SEVERITY_BG: Record<string, string> = {
  CRITICAL: "border-l-red-500 bg-red-50/60 dark:bg-red-950/20",
  HIGH:     "border-l-orange-400 bg-orange-50/60 dark:bg-orange-950/20",
  MEDIUM:   "border-l-yellow-400 bg-yellow-50/60 dark:bg-yellow-950/20",
  LOW:      "border-l-green-400 bg-green-50/60 dark:bg-green-950/20",
};

const SEVERITY_BADGE: Record<string, string> = {
  CRITICAL: "bg-red-500 text-white",
  HIGH:     "bg-orange-500 text-white",
  MEDIUM:   "bg-yellow-400 text-black",
  LOW:      "bg-green-500 text-white",
};

const RISK_BADGE: Record<string, string> = {
  CRITICAL: "bg-red-500/15 text-red-700 border-red-300 dark:text-red-400",
  HIGH:     "bg-orange-500/15 text-orange-700 border-orange-300 dark:text-orange-400",
  MEDIUM:   "bg-yellow-400/15 text-yellow-700 border-yellow-300 dark:text-yellow-400",
  LOW:      "bg-green-500/15 text-green-700 border-green-300 dark:text-green-400",
};

const TIMEFRAME_BADGE: Record<string, string> = {
  "Immediate":      "bg-red-100 text-red-700 border-red-300",
  "Within 7 days":  "bg-orange-100 text-orange-700 border-orange-300",
  "Within 14 days": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Within 30 days": "bg-blue-100 text-blue-700 border-blue-300",
};

function SectionToggle({
  icon: Icon, title, count, badge, expanded, onToggle,
}: {
  icon: React.ElementType; title: string; count: number;
  badge?: { label: string; color: string }; expanded: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-muted/40 transition-colors text-left border-b last:border-b-0"
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium flex-1">{title}</span>
      {badge && (
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${badge.color}`}>{badge.label}</span>
      )}
      <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{count}</span>
      {expanded
        ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
    </button>
  );
}

export function MatterAnalysisPanel({
  matterId,
  documents,
  matterContext,
}: {
  matterId: string;
  documents: Document[];
  matterContext: MatterContext;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(documents.map((d) => d.id)));
  const [step, setStep] = useState<"select" | "analysing" | "results" | "drafting" | "memo">("select");
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null);
  const [memoHtml, setMemoHtml] = useState("");
  const [savingMemo, setSavingMemo] = useState(false);
  const [expanded, setExpanded] = useState({ urgent: true, defects: true, clauses: false, inconsistencies: false });
  const toggle = (k: keyof typeof expanded) => setExpanded((p) => ({ ...p, [k]: !p[k] }));

  const toggleDoc = (id: string) =>
    setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelectedIds(selectedIds.size === documents.length ? new Set() : new Set(documents.map((d) => d.id)));

  const runDocumentIntelligence = async () => {
    if (selectedIds.size === 0) { toast.error("Select at least one document"); return; }
    setStep("analysing");
    try {
      const res = await fetch("/api/analysis/bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds: Array.from(selectedIds), matterContext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysis(data.analysis);
      setStep("results");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
      setStep("select");
    }
  };

  const runDraftBrief = async () => {
    if (!analysis) return;
    setStep("drafting");
    try {
      const res = await fetch("/api/analysis/memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          matterName: matterContext.matterName,
          clientName: matterContext.clientName,
          matterType: matterContext.matterType,
          practiceArea: matterContext.practiceArea,
          jurisdiction: matterContext.jurisdiction,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Memo generation failed");
      setMemoHtml(data.memoHtml);
      setStep("memo");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Memo generation failed");
      setStep("results");
    }
  };

  const openInEditor = async () => {
    if (!memoHtml) return;
    setSavingMemo(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Briefing Note — ${matterContext.matterName ?? "Matter"}`,
          content: memoHtml,
          documentType: "Legal Document",
          jurisdiction: "General",
          status: "DRAFT",
          matterId: matterContext.matterId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create document");
      router.push(`/documents/${data.document.id}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to open in editor");
      setSavingMemo(false);
    }
  };

  const copyMemo = () => {
    const text = memoHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const reset = () => { setStep("select"); setAnalysis(null); setMemoHtml(""); };

  // Empty state
  if (documents.length === 0) {
    return (
      <div className="rounded-sm border bg-card p-12 flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-muted">
          <FileSearch className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No documents to analyse</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add documents to this matter, then run AI analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border bg-card overflow-hidden">

      {/* ── Panel header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Legal Analysis</p>
            <p className="text-[11px] text-muted-foreground">Document Intelligence · Draft Brief</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <StageChip label="Document Intelligence" done={step !== "select" && step !== "analysing"} active={step === "analysing"} />
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <StageChip label="Draft Brief" done={step === "memo"} active={step === "drafting"} />
        </div>
      </div>

      {/* ── Step 1: Select & run Document Intelligence ─────────────────── */}
      {(step === "select" || step === "analysing") && (
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Documents to analyse
              </p>
              <button onClick={toggleAll} className="text-xs text-primary hover:underline">
                {selectedIds.size === documents.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="rounded-sm border divide-y overflow-hidden">
              {documents.map((doc) => (
                <label key={doc.id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 cursor-pointer transition-colors">
                  <input type="checkbox" checked={selectedIds.has(doc.id)}
                    onChange={() => toggleDoc(doc.id)} className="rounded" />
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 shrink-0">
                    <FileText className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm flex-1 truncate">{doc.title}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 uppercase tracking-wide">
                    {doc.status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-sm bg-muted/40 border p-3 space-y-1">
            <p className="text-xs font-medium flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" /> What Document Intelligence does
            </p>
            <ul className="text-xs text-muted-foreground space-y-0.5 pl-5 list-disc">
              <li>Surfaces defects in notices and key documents</li>
              <li>Extracts critical clauses with source references</li>
              <li>Flags inconsistencies across documents</li>
              <li>Prioritises urgent issues for senior review</li>
            </ul>
          </div>

          <Button onClick={runDocumentIntelligence}
            disabled={selectedIds.size === 0 || step === "analysing"}
            className="w-full h-9 rounded-sm gap-2">
            {step === "analysing" ? (
              <><Loader2 className="h-4 w-4 animate-spin" />
                Analysing {selectedIds.size} document{selectedIds.size !== 1 ? "s" : ""}…</>
            ) : (
              <><FileSearch className="h-4 w-4" />
                Run Document Intelligence ({selectedIds.size})</>
            )}
          </Button>
        </div>
      )}

      {/* ── Step 2: Analysis results ────────────────────────────────────── */}
      {(step === "results" || step === "drafting") && analysis && (
        <div>
          {/* Risk summary bar */}
          <div className="px-4 py-4 border-b space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold ${RISK_BADGE[analysis.overallRiskLevel]}`}>
                {analysis.overallRiskLevel} RISK
              </span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-32">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${analysis.confidenceScore}%` }} />
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{analysis.confidenceScore}% confidence</span>
              </div>
              <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <RotateCcw className="h-3 w-3" /> Re-run
              </button>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{analysis.seniorSummary}</p>
          </div>

          {/* Urgent Issues */}
          {analysis.urgentIssues.length > 0 && (
            <div className="border-b">
              <SectionToggle icon={Zap} title="Urgent Issues" count={analysis.urgentIssues.length}
                badge={analysis.urgentIssues.length > 0 ? { label: "ACTION REQUIRED", color: "bg-red-50 text-red-600 border-red-200" } : undefined}
                expanded={expanded.urgent} onToggle={() => toggle("urgent")} />
              {expanded.urgent && (
                <div className="divide-y">
                  {analysis.urgentIssues.map((issue) => (
                    <div key={issue.id} className="px-4 py-3 space-y-1.5">
                      <div className="flex items-start gap-2 justify-between">
                        <p className="text-sm font-medium leading-snug">{issue.title}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${TIMEFRAME_BADGE[issue.timeframe] ?? "bg-muted text-muted-foreground border-border"}`}>
                          {issue.timeframe}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{issue.description}</p>
                      <div className="flex items-start gap-1.5 text-xs text-primary font-medium">
                        <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{issue.recommendedAction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Defects */}
          {analysis.defects.length > 0 && (
            <div className="border-b">
              <SectionToggle icon={AlertTriangle} title="Document Defects" count={analysis.defects.length}
                expanded={expanded.defects} onToggle={() => toggle("defects")} />
              {expanded.defects && (
                <div className="divide-y">
                  {analysis.defects.map((defect) => (
                    <div key={defect.id} className={`px-4 py-3 border-l-4 space-y-1.5 ${SEVERITY_BG[defect.severity]}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${SEVERITY_BADGE[defect.severity]}`}>
                          {defect.severity}
                        </span>
                        <p className="text-sm font-medium">{defect.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{defect.description}</p>
                      <p className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {defect.sourceDocument}
                      </p>
                      <p className="text-xs font-medium">Recommended: {defect.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Key Clauses */}
          {analysis.keyClauses.length > 0 && (
            <div className="border-b">
              <SectionToggle icon={BookOpen} title="Key Clauses" count={analysis.keyClauses.length}
                expanded={expanded.clauses} onToggle={() => toggle("clauses")} />
              {expanded.clauses && (
                <div className="divide-y">
                  {analysis.keyClauses.map((clause) => (
                    <div key={clause.id} className="px-4 py-3 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {clause.type}
                        </span>
                        <span className="text-[11px] text-muted-foreground italic">{clause.sourceDocument}</span>
                      </div>
                      <p className="text-xs bg-muted rounded-sm px-3 py-2 font-mono leading-relaxed text-foreground">
                        {clause.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Why it matters: </span>
                        {clause.significance}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Inconsistencies */}
          {analysis.inconsistencies.length > 0 && (
            <div className="border-b">
              <SectionToggle icon={GitCompareArrows} title="Inconsistencies" count={analysis.inconsistencies.length}
                expanded={expanded.inconsistencies} onToggle={() => toggle("inconsistencies")} />
              {expanded.inconsistencies && (
                <div className="divide-y">
                  {analysis.inconsistencies.map((inc) => (
                    <div key={inc.id} className={`px-4 py-3 border-l-4 space-y-1.5 ${SEVERITY_BG[inc.severity]}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${SEVERITY_BADGE[inc.severity]}`}>
                          {inc.severity}
                        </span>
                        {inc.documentsInvolved.map((d) => (
                          <span key={d} className="text-[10px] bg-background px-1.5 py-0.5 rounded border">{d}</span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{inc.description}</p>
                      <p className="text-xs font-medium">Implication: {inc.implication}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Draft Brief CTA */}
          <div className="px-4 py-4 space-y-2 bg-muted/20">
            <div className="rounded-sm border bg-card p-3 space-y-1">
              <p className="text-xs font-medium flex items-center gap-1.5">
                <ScrollText className="h-3.5 w-3.5 text-primary" /> What Draft Brief produces
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5 pl-5 list-disc">
                <li>Structured internal memo for partner review</li>
                <li>Facts, issues, legal principles, risk table</li>
                <li>Potential defences and recommended next steps</li>
                <li>Opens directly in the document editor</li>
              </ul>
            </div>
            <Button onClick={runDraftBrief} disabled={step === "drafting"}
              className="w-full h-9 rounded-sm gap-2">
              {step === "drafting" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Drafting briefing note…</>
              ) : (
                <><ScrollText className="h-4 w-4" /> Draft Brief</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Memo preview + open in editor ──────────────────────── */}
      {step === "memo" && memoHtml && (
        <div>
          {/* Memo toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-green-50/60 dark:bg-green-950/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">Briefing Note Ready</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyMemo} className="h-7 text-xs rounded-sm gap-1.5">
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => setStep("results")} className="h-7 text-xs rounded-sm">
                ← Analysis
              </Button>
              <Button size="sm" onClick={openInEditor} disabled={savingMemo} className="h-7 text-xs rounded-sm gap-1.5">
                {savingMemo
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Opening…</>
                  : <><ExternalLink className="h-3.5 w-3.5" /> Open in Editor</>}
              </Button>
            </div>
          </div>

          {/* Memo preview */}
          <div
            className="px-6 py-5 text-sm leading-relaxed max-h-160 overflow-y-auto
              [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:pb-1 [&_h2]:border-b [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-muted-foreground
              [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1
              [&_p]:text-sm [&_p]:leading-relaxed [&_p]:my-2
              [&_ul]:my-2 [&_ul]:pl-5 [&_li]:text-sm [&_li]:my-0.5
              [&_ol]:my-2 [&_ol]:pl-5
              [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:my-3
              [&_th]:border [&_th]:p-2 [&_th]:bg-muted [&_th]:font-semibold [&_th]:text-left [&_th]:text-xs
              [&_td]:border [&_td]:p-2 [&_td]:align-top [&_td]:text-xs
              [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: memoHtml }}
          />

          {/* Open in editor (sticky footer) */}
          <div className="px-4 py-3 border-t bg-muted/30 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Open in the editor to review, edit, and save to this matter
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs rounded-sm text-muted-foreground">
                <RotateCcw className="h-3 w-3 mr-1.5" /> Start over
              </Button>
              <Button size="sm" onClick={openInEditor} disabled={savingMemo} className="h-7 text-xs rounded-sm gap-1.5">
                {savingMemo
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Opening…</>
                  : <><ExternalLink className="h-3.5 w-3.5" /> Open in Editor</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StageChip({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
      done    ? "bg-primary/15 text-primary border-primary/30"
      : active ? "bg-muted text-muted-foreground border-border animate-pulse"
               : "bg-muted text-muted-foreground border-border"
    }`}>
      {done && <CheckCircle2 className="h-2.5 w-2.5 inline mr-1" />}{label}
    </span>
  );
}

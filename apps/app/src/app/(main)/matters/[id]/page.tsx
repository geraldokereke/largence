"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  Receipt,
  Edit,
  Trash2,
  Loader2,
  Plus,
  MoreHorizontal,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { MatterAnalysisPanel } from "@largence/components/matter-analysis-panel";

interface Document {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Matter {
  id: string;
  name: string;
  description: string | null;
  matterNumber: string | null;
  status: string;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  clientCompany: string | null;
  matterType: string | null;
  practiceArea: string | null;
  openDate: string;
  closeDate: string | null;
  dueDate: string | null;
  billingType: string;
  hourlyRate: number | null;
  flatFee: number | null;
  retainerAmount: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  documents: Document[];
  _count: { documents: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE:   { label: "Active",   color: "bg-green-500/15 text-green-700 border-green-200 dark:text-green-400" },
  PENDING:  { label: "Pending",  color: "bg-yellow-500/15 text-yellow-700 border-yellow-200 dark:text-yellow-400" },
  ON_HOLD:  { label: "On Hold",  color: "bg-orange-500/15 text-orange-700 border-orange-200 dark:text-orange-400" },
  CLOSED:   { label: "Closed",   color: "bg-muted text-muted-foreground border-border" },
  ARCHIVED: { label: "Archived", color: "bg-muted text-muted-foreground border-border" },
};

const MATTER_STATUSES = ["ACTIVE", "PENDING", "ON_HOLD", "CLOSED", "ARCHIVED"];

const BILLING_LABEL: Record<string, string> = {
  HOURLY: "Hourly", FLAT_FEE: "Flat Fee", CONTINGENCY: "Contingency",
  RETAINER: "Retainer", PRO_BONO: "Pro Bono",
};

const DOC_STATUS_COLOR: Record<string, string> = {
  FINAL: "bg-green-500/15 text-green-700 border-green-200",
  DRAFT: "bg-yellow-500/15 text-yellow-700 border-yellow-200",
  ARCHIVED: "bg-muted text-muted-foreground border-border",
};

export default function MatterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchMatter(); }, [id]);

  const fetchMatter = async () => {
    try {
      const res = await fetch(`/api/matters/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMatter(data);
        setNewStatus(data.status);
      } else if (res.status === 404) {
        toast.error("Matter not found");
        router.push("/matters");
      }
    } catch {
      toast.error("Failed to load matter");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!matter) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/matters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...(newStatus === "CLOSED" && { closeDate: new Date().toISOString() }) }),
      });
      if (res.ok) { toast.success("Status updated"); setStatusDialogOpen(false); fetchMatter(); }
      else { const e = await res.json(); toast.error(e.error || "Failed to update status"); }
    } catch { toast.error("Failed to update status"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${matter?.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/matters/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Matter deleted"); router.push("/matters"); }
      else { const e = await res.json(); toast.error(e.error || "Failed to delete"); }
    } catch { toast.error("Failed to delete matter"); }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-4 gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-sm" />
          <div className="flex-1"><Skeleton className="h-5 w-48 mb-1" /><Skeleton className="h-3 w-24" /></div>
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map((i) => <Skeleton key={i} className="h-40 rounded-sm" />)}
        </div>
      </div>
    );
  }

  if (!matter) return null;

  const sc = STATUS_CONFIG[matter.status] ?? STATUS_CONFIG.ACTIVE;

  return (
    <div className="flex flex-1 flex-col p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm shrink-0" onClick={() => router.push("/matters")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 shrink-0">
          <Briefcase className="h-4.5 w-4.5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold truncate">{matter.name}</h1>
            <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium ${sc.color}`}>
              {sc.label}
            </span>
          </div>
          {matter.matterNumber && <p className="text-xs text-muted-foreground">{matter.matterNumber}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="h-8 rounded-sm gap-1.5 text-xs"
            onClick={() => router.push(`/documents/new?matterId=${id}`)}>
            <Plus className="h-3.5 w-3.5" /> Add Document
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-sm w-40">
              <DropdownMenuItem className="text-xs" onClick={() => setStatusDialogOpen(true)}>
                <Clock className="h-3.5 w-3.5 mr-2" /> Change Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-destructive" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Matter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {matter.description && (
        <p className="text-sm text-muted-foreground mb-4 -mt-2">{matter.description}</p>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-8 rounded-sm mb-4 w-auto">
          <TabsTrigger value="overview"  className="h-7 text-xs rounded-sm px-3">Overview</TabsTrigger>
          <TabsTrigger value="documents" className="h-7 text-xs rounded-sm px-3 gap-1.5">
            Documents
            <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0 rounded-full font-medium">
              {matter._count.documents}
            </span>
          </TabsTrigger>
          <TabsTrigger value="analysis"  className="h-7 text-xs rounded-sm px-3 gap-1.5">
            <Sparkles className="h-3 w-3" /> AI Analysis
          </TabsTrigger>
        </TabsList>

        {/* ── Overview tab ───────────────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-0">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">

            {/* Client */}
            <div className="rounded-sm border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Client</h3>
              </div>
              {matter.clientName ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{matter.clientName}</p>
                  {matter.clientCompany && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building className="h-3.5 w-3.5 shrink-0" />{matter.clientCompany}
                    </div>
                  )}
                  {matter.clientEmail && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <a href={`mailto:${matter.clientEmail}`} className="hover:text-primary truncate">{matter.clientEmail}</a>
                    </div>
                  )}
                  {matter.clientPhone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <a href={`tel:${matter.clientPhone}`} className="hover:text-primary">{matter.clientPhone}</a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No client information</p>
              )}
            </div>

            {/* Details */}
            <div className="rounded-sm border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: "Type",         value: matter.matterType },
                  { label: "Practice",     value: matter.practiceArea },
                  { label: "Billing",      value: BILLING_LABEL[matter.billingType] },
                  { label: "Rate",         value: matter.hourlyRate ? `$${matter.hourlyRate}/hr` : matter.flatFee ? `$${matter.flatFee.toLocaleString()}` : matter.retainerAmount ? `$${matter.retainerAmount.toLocaleString()} retainer` : null },
                  { label: "Opened",       value: format(new Date(matter.openDate), "dd MMM yyyy") },
                  { label: "Due",          value: matter.dueDate ? format(new Date(matter.dueDate), "dd MMM yyyy") : null },
                ].map(({ label, value }) => value ? (
                  <div key={label}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-sm border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</h3>
              </div>
              {matter.notes
                ? <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{matter.notes}</p>
                : <p className="text-sm text-muted-foreground">No notes</p>}
            </div>

            {/* Billing summary */}
            <div className="rounded-sm border bg-card p-4 md:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timeline</h3>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Opened</p>
                  <p className="font-medium">{format(new Date(matter.openDate), "dd MMM yyyy")}</p>
                </div>
                {matter.dueDate && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Due</p>
                    <p className="font-medium">{format(new Date(matter.dueDate), "dd MMM yyyy")}</p>
                  </div>
                )}
                {matter.closeDate && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Closed</p>
                    <p className="font-medium">{format(new Date(matter.closeDate), "dd MMM yyyy")}</p>
                  </div>
                )}
                <div className="ml-auto text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Last updated</p>
                  <p className="font-medium">{formatDistanceToNow(new Date(matter.updatedAt), { addSuffix: true })}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Documents tab ──────────────────────────────────────────────── */}
        <TabsContent value="documents" className="mt-0">
          {matter.documents.length === 0 ? (
            <div className="rounded-sm border bg-card p-10 flex flex-col items-center gap-3 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">No documents yet</p>
                <p className="text-xs text-muted-foreground">Add documents to this matter to get started</p>
              </div>
              <Button size="sm" className="h-8 rounded-sm gap-1.5 text-xs mt-1"
                onClick={() => router.push(`/documents/new?matterId=${id}`)}>
                <Plus className="h-3.5 w-3.5" /> New Document
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {matter.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex items-center gap-3 rounded-sm border bg-card p-3 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => router.push(`/documents/${doc.id}`)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{doc.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium ${DOC_STATUS_COLOR[doc.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                    {doc.status}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))}

              <Button variant="outline" size="sm" className="w-full h-8 rounded-sm gap-1.5 text-xs mt-1 border-dashed"
                onClick={() => router.push(`/documents/new?matterId=${id}`)}>
                <Plus className="h-3.5 w-3.5" /> Add Document
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ── Analysis tab ───────────────────────────────────────────────── */}
        <TabsContent value="analysis" className="mt-0">
          <MatterAnalysisPanel
            matterId={id}
            documents={matter.documents}
            matterContext={{
              matterId: id,
              matterName: matter.name,
              clientName: matter.clientName ?? undefined,
              matterType: matter.matterType ?? undefined,
              practiceArea: matter.practiceArea ?? undefined,
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Status dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-xs rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Change Status</DialogTitle>
            <DialogDescription className="text-sm">Update the status of this matter</DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <div>
              <Label className="text-xs mb-1.5 block">Current</Label>
              <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium ${sc.color}`}>{sc.label}</span>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="h-8 text-sm rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MATTER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="text-sm">{STATUS_CONFIG[s]?.label ?? s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-8 text-sm rounded-sm" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button className="h-8 text-sm rounded-sm" onClick={handleStatusChange}
              disabled={submitting || newStatus === matter.status}>
              {submitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />} Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

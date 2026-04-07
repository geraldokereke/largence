"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";

import { Skeleton } from "@largence/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@largence/components/ui/tabs";
import { EmptyState } from "@largence/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@largence/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu";
import { Label } from "@largence/components/ui/label";
import { Textarea } from "@largence/components/ui/textarea";
import {
  Briefcase,
  Plus,
  Search,
  MoreVertical,
  FileText,
  DollarSign,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { CountryCombobox, countries } from "@largence/components/ui/country-combobox";

// Derive jurisdiction display label from country combobox value
const getJurisdictionLabel = (value: string) => countries.find((c) => c.value === value)?.label ?? value;
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Matter {
  id: string;
  name: string;
  description: string | null;
  matterNumber: string | null;
  status: string;
  clientName: string | null;
  clientCompany: string | null;
  matterType: string | null;
  practiceArea: string | null;
  jurisdiction: string | null;
  openDate: string;
  dueDate: string | null;
  billingType: string;
  hourlyRate: number | null;
  flatFee: number | null;
  retainerAmount: number | null;
  notes: string | null;
  updatedAt: string;
  _count: { documents: number };
}

interface MattersResponse {
  matters: Matter[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; tab: string }> = {
  ACTIVE:   { label: "Active",    color: "bg-green-500/15 text-green-700 border-green-200 dark:text-green-400",   tab: "active" },
  PENDING:  { label: "Pending",   color: "bg-yellow-500/15 text-yellow-700 border-yellow-200 dark:text-yellow-400", tab: "pending" },
  ON_HOLD:  { label: "On Hold",   color: "bg-orange-500/15 text-orange-700 border-orange-200 dark:text-orange-400", tab: "on_hold" },
  CLOSED:   { label: "Closed",    color: "bg-muted text-muted-foreground border-border",                           tab: "closed" },
  ARCHIVED: { label: "Archived",  color: "bg-muted text-muted-foreground border-border",                           tab: "archived" },
};

const BILLING_TYPES  = ["HOURLY", "FLAT_FEE", "CONTINGENCY", "RETAINER", "PRO_BONO"];
const MATTER_TYPES   = ["Litigation", "Corporate", "Real Estate", "Intellectual Property", "Employment", "Tax", "Immigration", "Estate Planning", "Family Law", "Criminal Defense", "Bankruptcy", "Other"];
const PRACTICE_AREAS = ["Commercial", "Civil Rights", "Contract", "Personal Injury", "Medical Malpractice", "Insurance", "Securities", "Environmental", "Mergers & Acquisitions", "Other"];

const emptyForm = {
  name: "", description: "", matterNumber: "", clientName: "", clientEmail: "",
  clientPhone: "", clientCompany: "", matterType: "", practiceArea: "", jurisdiction: "",
  dueDate: "", billingType: "HOURLY", hourlyRate: "", flatFee: "", retainerAmount: "", notes: "",
};

async function fetchMatters(search?: string, status?: string): Promise<MattersResponse> {
  const p = new URLSearchParams();
  if (search) p.set("search", search);
  if (status && status !== "all") p.set("status", status);
  const res = await fetch(`/api/matters?${p}`);
  if (!res.ok) throw new Error("Failed to fetch matters");
  return res.json();
}

export default function MattersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editMatter, setEditMatter] = useState<Matter | null>(null);
  const [form, setForm] = useState(emptyForm);
  const f = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const statusFilter = tab === "all" ? undefined : tab.toUpperCase().replace("-", "_");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["matters", search, statusFilter],
    queryFn: () => fetchMatters(search, statusFilter),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch("/api/matters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matters"] });
      toast.success("Matter created");
      setCreateOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Failed to create matter"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      fetch(`/api/matters/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matters"] });
      toast.success("Matter updated");
      setEditMatter(null);
    },
    onError: () => toast.error("Failed to update matter"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/matters/${id}`, { method: "DELETE" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["matters"] }); toast.success("Matter deleted"); },
    onError: () => toast.error("Failed to delete matter"),
  });

  const matters = data?.matters ?? [];

  const counts = useMemo(() => ({
    all:      matters.length,
    active:   matters.filter((m) => m.status === "ACTIVE").length,
    pending:  matters.filter((m) => m.status === "PENDING").length,
    on_hold:  matters.filter((m) => m.status === "ON_HOLD").length,
    closed:   matters.filter((m) => m.status === "CLOSED").length,
  }), [matters]);

  const openEdit = (m: Matter) => {
    setEditMatter(m);
    setForm({
      name: m.name, description: m.description ?? "", matterNumber: m.matterNumber ?? "",
      clientName: m.clientName ?? "", clientEmail: "", clientPhone: "", clientCompany: m.clientCompany ?? "",
      matterType: m.matterType ?? "", practiceArea: m.practiceArea ?? "", jurisdiction: m.jurisdiction ?? "",
      dueDate: m.dueDate ? m.dueDate.split("T")[0] : "",
      billingType: m.billingType, hourlyRate: m.hourlyRate?.toString() ?? "",
      flatFee: m.flatFee?.toString() ?? "", retainerAmount: m.retainerAmount?.toString() ?? "",
      notes: m.notes ?? "",
    });
  };

  const handleDelete = (m: Matter) => {
    if (!confirm(`Delete "${m.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(m.id);
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col p-4 gap-4">
        <div className="flex items-center justify-between">
          <div><Skeleton className="h-6 w-40 mb-1" /><Skeleton className="h-4 w-64" /></div>
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-8 w-full max-w-sm" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-36 rounded-sm" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 gap-3">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-medium">Failed to load matters</p>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="rounded-sm gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    );
  }

  // ── Form fields (shared create/edit) ────────────────────────────────────
  const formFields = (
    <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1"><Label className="text-xs">Matter Name *</Label>
          <Input value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="e.g. Smith v Johnson" className="h-8 text-sm rounded-sm" /></div>
        <div className="space-y-1"><Label className="text-xs">Matter Number</Label>
          <Input value={form.matterNumber} onChange={(e) => f("matterNumber", e.target.value)} placeholder="M-2024-001" className="h-8 text-sm rounded-sm" /></div>
        <div className="space-y-1"><Label className="text-xs">Due Date</Label>
          <Input type="date" value={form.dueDate} onChange={(e) => f("dueDate", e.target.value)} className="h-8 text-sm rounded-sm" /></div>
        <div className="space-y-1"><Label className="text-xs">Matter Type</Label>
          <Select value={form.matterType} onValueChange={(v) => f("matterType", v)}>
            <SelectTrigger className="h-8 text-sm rounded-sm"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{MATTER_TYPES.map((t) => <SelectItem key={t} value={t} className="text-sm">{t}</SelectItem>)}</SelectContent>
          </Select></div>
        <div className="space-y-1"><Label className="text-xs">Practice Area</Label>
          <Select value={form.practiceArea} onValueChange={(v) => f("practiceArea", v)}>
            <SelectTrigger className="h-8 text-sm rounded-sm"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{PRACTICE_AREAS.map((a) => <SelectItem key={a} value={a} className="text-sm">{a}</SelectItem>)}</SelectContent>
          </Select></div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Jurisdiction</Label>
          <CountryCombobox
            value={form.jurisdiction}
            onValueChange={(v) => f("jurisdiction", v)}
            placeholder="Select country / jurisdiction..."
          />
          <p className="text-[11px] text-muted-foreground">Governing law for AI analysis. State-level laws are inferred from the selected country and practice area.</p>
        </div>
      </div>

      <div className="border-t pt-3">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Client</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label className="text-xs">Client Name</Label>
            <Input value={form.clientName} onChange={(e) => f("clientName", e.target.value)} placeholder="Jane Smith" className="h-8 text-sm rounded-sm" /></div>
          <div className="space-y-1"><Label className="text-xs">Company</Label>
            <Input value={form.clientCompany} onChange={(e) => f("clientCompany", e.target.value)} placeholder="Acme Ltd" className="h-8 text-sm rounded-sm" /></div>
        </div>
      </div>

      <div className="border-t pt-3">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><DollarSign className="h-3 w-3" />Billing</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1"><Label className="text-xs">Billing Type</Label>
            <Select value={form.billingType} onValueChange={(v) => f("billingType", v)}>
              <SelectTrigger className="h-8 text-sm rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{BILLING_TYPES.map((t) => <SelectItem key={t} value={t} className="text-sm">{t.replace("_", " ")}</SelectItem>)}</SelectContent>
            </Select></div>
          {form.billingType === "HOURLY" && <div className="space-y-1"><Label className="text-xs">Hourly Rate</Label>
            <Input type="number" value={form.hourlyRate} onChange={(e) => f("hourlyRate", e.target.value)} placeholder="250" className="h-8 text-sm rounded-sm" /></div>}
          {form.billingType === "FLAT_FEE" && <div className="space-y-1"><Label className="text-xs">Flat Fee</Label>
            <Input type="number" value={form.flatFee} onChange={(e) => f("flatFee", e.target.value)} placeholder="5000" className="h-8 text-sm rounded-sm" /></div>}
          {form.billingType === "RETAINER" && <div className="space-y-1"><Label className="text-xs">Retainer</Label>
            <Input type="number" value={form.retainerAmount} onChange={(e) => f("retainerAmount", e.target.value)} placeholder="10000" className="h-8 text-sm rounded-sm" /></div>}
        </div>
      </div>

      <div className="border-t pt-3 space-y-1">
        <Label className="text-xs">Notes</Label>
        <Textarea value={form.notes} onChange={(e) => f("notes", e.target.value)} rows={2} className="text-sm rounded-sm resize-none" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold font-display">Matters</h1>
          <p className="text-sm text-muted-foreground">Manage cases and client matters</p>
        </div>
        <Button size="sm" className="h-8 rounded-sm gap-1.5" onClick={() => { setForm(emptyForm); setCreateOpen(true); }}>
          <Plus className="h-4 w-4" /> New Matter
        </Button>
      </div>

      {/* Search + tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search matters..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm rounded-sm" />
        </div>
        <Tabs value={tab} onValueChange={setTab} className="w-auto">
          <TabsList className="h-8 rounded-sm">
            {[
              { value: "all",     label: "All",     count: counts.all },
              { value: "active",  label: "Active",  count: counts.active },
              { value: "pending", label: "Pending", count: counts.pending },
              { value: "on_hold", label: "On Hold", count: counts.on_hold },
              { value: "closed",  label: "Closed",  count: counts.closed },
            ].map(({ value, label, count }) => (
              <TabsTrigger key={value} value={value} className="h-7 text-xs rounded-sm px-2.5 gap-1.5">
                {label}
                {count > 0 && <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0 rounded-full font-medium">{count}</span>}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      {matters.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-muted-foreground" />}
          title={search ? "No matches found" : "No matters yet"}
          description={search ? "Try a different search term" : "Create your first matter to start organising your cases"}
          action={!search ? (
            <Button size="sm" className="h-8 rounded-sm gap-1.5" onClick={() => { setForm(emptyForm); setCreateOpen(true); }}>
              <Plus className="h-4 w-4" /> New Matter
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {matters.map((m) => {
            const sc = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.ACTIVE;
            return (
              <div
                key={m.id}
                className="group relative rounded-sm border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer flex flex-col"
                onClick={() => router.push(`/matters/${m.id}`)}
              >
                {/* Actions */}
                <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 rounded-sm">
                      <DropdownMenuItem className="text-xs" onClick={() => router.push(`/matters/${m.id}`)}>
                        <ChevronRight className="h-3.5 w-3.5 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs" onClick={() => openEdit(m)}>
                        <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs text-destructive" onClick={() => handleDelete(m)}>
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Icon + title */}
                <div className="flex items-start gap-3 mb-3 pr-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 shrink-0">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{m.name}</p>
                    {m.matterNumber && <p className="text-[11px] text-muted-foreground">{m.matterNumber}</p>}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium ${sc.color}`}>{sc.label}</span>
                  {m.matterType && <span className="inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">{m.matterType}</span>}
                  {m.jurisdiction && <span className="inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">{getJurisdictionLabel(m.jurisdiction)}</span>}
                </div>

                {/* Client */}
                {m.clientName && (
                  <div className="text-xs text-muted-foreground mb-1.5 truncate">
                    {m.clientName}{m.clientCompany ? ` · ${m.clientCompany}` : ""}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{m._count.documents} doc{m._count.documents !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(m.updatedAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-base">New Matter</DialogTitle>
            <DialogDescription className="text-sm">Create a new legal matter or case</DialogDescription>
          </DialogHeader>
          {formFields}
          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-8 text-sm rounded-sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="h-8 text-sm rounded-sm" disabled={!form.name.trim() || createMutation.isPending} onClick={() => createMutation.mutate(form)}>
              {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />} Create Matter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editMatter} onOpenChange={(o) => { if (!o) setEditMatter(null); }}>
        <DialogContent className="sm:max-w-md rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Matter</DialogTitle>
            <DialogDescription className="text-sm">Update matter details</DialogDescription>
          </DialogHeader>
          {formFields}
          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-8 text-sm rounded-sm" onClick={() => setEditMatter(null)}>Cancel</Button>
            <Button className="h-8 text-sm rounded-sm" disabled={!form.name.trim() || updateMutation.isPending} onClick={() => editMatter && updateMutation.mutate({ id: editMatter.id, body: form })}>
              {updateMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

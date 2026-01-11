"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@largence/components/ui/skeleton";
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
  MoreHorizontal,
  FileText,
  Calendar,
  User,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";

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
  _count: {
    documents: number;
  };
}

interface MattersResponse {
  matters: Matter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const MATTER_STATUSES = [
  { value: "ACTIVE", label: "Active", color: "bg-green-500" },
  { value: "PENDING", label: "Pending", color: "bg-yellow-500" },
  { value: "ON_HOLD", label: "On Hold", color: "bg-orange-500" },
  { value: "CLOSED", label: "Closed", color: "bg-gray-500" },
  { value: "ARCHIVED", label: "Archived", color: "bg-gray-400" },
];

const BILLING_TYPES = [
  { value: "HOURLY", label: "Hourly" },
  { value: "FLAT_FEE", label: "Flat Fee" },
  { value: "CONTINGENCY", label: "Contingency" },
  { value: "RETAINER", label: "Retainer" },
  { value: "PRO_BONO", label: "Pro Bono" },
];

const MATTER_TYPES = [
  "Litigation",
  "Corporate",
  "Real Estate",
  "Intellectual Property",
  "Employment",
  "Tax",
  "Immigration",
  "Estate Planning",
  "Family Law",
  "Criminal Defense",
  "Bankruptcy",
  "Other",
];

const PRACTICE_AREAS = [
  "Commercial",
  "Civil Rights",
  "Contract",
  "Personal Injury",
  "Medical Malpractice",
  "Insurance",
  "Securities",
  "Environmental",
  "Mergers & Acquisitions",
  "Other",
];

async function fetchMatters(search?: string, status?: string): Promise<MattersResponse> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);

  const response = await fetch(`/api/matters?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch matters");
  return response.json();
}

async function createMatter(data: Record<string, unknown>): Promise<Matter> {
  const response = await fetch("/api/matters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create matter");
  return response.json();
}

async function updateMatter(id: string, data: Record<string, unknown>): Promise<Matter> {
  const response = await fetch(`/api/matters/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update matter");
  return response.json();
}

async function deleteMatter(id: string): Promise<void> {
  const response = await fetch(`/api/matters/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete matter");
}

export default function MattersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    matterNumber: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientCompany: "",
    matterType: "",
    practiceArea: "",
    dueDate: "",
    billingType: "HOURLY",
    hourlyRate: "",
    flatFee: "",
    retainerAmount: "",
    notes: "",
  });

  // Fetch matters with React Query
  const {
    data: mattersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["matters", searchQuery, statusFilter],
    queryFn: () => fetchMatters(searchQuery, statusFilter),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createMatter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matters"] });
      toast.success("Matter created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create matter");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateMatter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matters"] });
      toast.success("Matter updated successfully");
      setIsEditDialogOpen(false);
      setSelectedMatter(null);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to update matter");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMatter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matters"] });
      toast.success("Matter deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete matter");
    },
  });

  const matters = mattersData?.matters || [];

  // Calculate stats
  const stats = useMemo(() => {
    const active = matters.filter((m) => m.status === "ACTIVE").length;
    const pending = matters.filter((m) => m.status === "PENDING").length;
    const totalDocs = matters.reduce((acc, m) => acc + m._count.documents, 0);
    return { total: matters.length, active, pending, totalDocs };
  }, [matters]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      matterNumber: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientCompany: "",
      matterType: "",
      practiceArea: "",
      dueDate: "",
      billingType: "HOURLY",
      hourlyRate: "",
      flatFee: "",
      retainerAmount: "",
      notes: "",
    });
  };

  const handleCreateMatter = () => {
    if (!formData.name.trim()) {
      toast.error("Matter name is required");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditMatter = () => {
    if (!selectedMatter || !formData.name.trim()) {
      toast.error("Matter name is required");
      return;
    }
    updateMutation.mutate({ id: selectedMatter.id, data: formData });
  };

  const handleDeleteMatter = (matter: Matter) => {
    if (!confirm(`Are you sure you want to delete "${matter.name}"?`)) return;
    deleteMutation.mutate(matter.id);
  };

  const openEditDialog = (matter: Matter) => {
    setSelectedMatter(matter);
    setFormData({
      name: matter.name,
      description: matter.description || "",
      matterNumber: matter.matterNumber || "",
      clientName: matter.clientName || "",
      clientEmail: matter.clientEmail || "",
      clientPhone: matter.clientPhone || "",
      clientCompany: matter.clientCompany || "",
      matterType: matter.matterType || "",
      practiceArea: matter.practiceArea || "",
      dueDate: matter.dueDate ? matter.dueDate.split("T")[0] : "",
      billingType: matter.billingType,
      hourlyRate: matter.hourlyRate?.toString() || "",
      flatFee: matter.flatFee?.toString() || "",
      retainerAmount: matter.retainerAmount?.toString() || "",
      notes: matter.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = MATTER_STATUSES.find((s) => s.value === status);
    return (
      <Badge
        variant="secondary"
        className={`${statusConfig?.color || "bg-gray-500"} text-white text-[10px]`}
      >
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const statCards = [
    {
      label: "Total Matters",
      value: stats.total.toString(),
      change: "All time",
      icon: Briefcase,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Active",
      value: stats.active.toString(),
      change: "Currently open",
      icon: TrendingUp,
      color: "text-green-600 bg-green-500/10",
    },
    {
      label: "Pending",
      value: stats.pending.toString(),
      change: "Awaiting action",
      icon: Calendar,
      color: "text-yellow-600 bg-yellow-500/10",
    },
    {
      label: "Documents",
      value: stats.totalDocs.toString(),
      change: "Across all matters",
      icon: FileText,
      color: "text-blue-600 bg-blue-500/10",
    },
  ];

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col p-3">
        {/* Header Skeleton */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <Skeleton className="h-7 w-48 mb-1" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-sm border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <Skeleton className="h-8 w-8 rounded-sm" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>

        {/* Search Skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Skeleton className="h-8 flex-1 max-w-md" />
          <Skeleton className="h-8 w-40" />
        </div>

        {/* Matter Cards Skeleton */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-sm border bg-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-6" />
              </div>
              <div className="flex gap-2 mb-3">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-3">
        <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-base font-semibold mb-1.5">Failed to load matters</h2>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error loading your matters.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="rounded-sm h-8 text-sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const matterFormFields = (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs">Matter Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Smith v. Johnson"
            className="h-8 text-sm rounded-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="matterNumber" className="text-xs">Matter Number</Label>
          <Input
            id="matterNumber"
            value={formData.matterNumber}
            onChange={(e) => setFormData({ ...formData, matterNumber: e.target.value })}
            placeholder="e.g., M-2024-001"
            className="h-8 text-sm rounded-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the matter..."
          rows={2}
          className="text-sm rounded-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="matterType" className="text-xs">Matter Type</Label>
          <Select
            value={formData.matterType}
            onValueChange={(value) => setFormData({ ...formData, matterType: value })}
          >
            <SelectTrigger className="h-8 text-sm rounded-sm">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {MATTER_TYPES.map((type) => (
                <SelectItem key={type} value={type} className="text-sm">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="practiceArea" className="text-xs">Practice Area</Label>
          <Select
            value={formData.practiceArea}
            onValueChange={(value) => setFormData({ ...formData, practiceArea: value })}
          >
            <SelectTrigger className="h-8 text-sm rounded-sm">
              <SelectValue placeholder="Select area" />
            </SelectTrigger>
            <SelectContent>
              {PRACTICE_AREAS.map((area) => (
                <SelectItem key={area} value={area} className="text-sm">
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-3 mt-1">
        <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5 text-muted-foreground">
          <User className="h-3.5 w-3.5" /> Client Information
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="clientName" className="text-xs">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="John Smith"
              className="h-8 text-sm rounded-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientCompany" className="text-xs">Company</Label>
            <Input
              id="clientCompany"
              value={formData.clientCompany}
              onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
              placeholder="Acme Corp"
              className="h-8 text-sm rounded-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientEmail" className="text-xs">Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              placeholder="john@example.com"
              className="h-8 text-sm rounded-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientPhone" className="text-xs">Phone</Label>
            <Input
              id="clientPhone"
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="h-8 text-sm rounded-sm"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-3 mt-1">
        <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5 text-muted-foreground">
          <DollarSign className="h-3.5 w-3.5" /> Billing Information
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="billingType" className="text-xs">Billing Type</Label>
            <Select
              value={formData.billingType}
              onValueChange={(value) => setFormData({ ...formData, billingType: value })}
            >
              <SelectTrigger className="h-8 text-sm rounded-sm">
                <SelectValue placeholder="Select billing type" />
              </SelectTrigger>
              <SelectContent>
                {BILLING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-sm">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dueDate" className="text-xs">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="h-8 text-sm rounded-sm"
            />
          </div>
          {formData.billingType === "HOURLY" && (
            <div className="space-y-1.5">
              <Label htmlFor="hourlyRate" className="text-xs">Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="250"
                className="h-8 text-sm rounded-sm"
              />
            </div>
          )}
          {formData.billingType === "FLAT_FEE" && (
            <div className="space-y-1.5">
              <Label htmlFor="flatFee" className="text-xs">Flat Fee ($)</Label>
              <Input
                id="flatFee"
                type="number"
                value={formData.flatFee}
                onChange={(e) => setFormData({ ...formData, flatFee: e.target.value })}
                placeholder="5000"
                className="h-8 text-sm rounded-sm"
              />
            </div>
          )}
          {formData.billingType === "RETAINER" && (
            <div className="space-y-1.5">
              <Label htmlFor="retainerAmount" className="text-xs">Retainer Amount ($)</Label>
              <Input
                id="retainerAmount"
                type="number"
                value={formData.retainerAmount}
                onChange={(e) => setFormData({ ...formData, retainerAmount: e.target.value })}
                placeholder="10000"
                className="h-8 text-sm rounded-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes..."
          rows={2}
          className="text-sm rounded-sm resize-none"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col p-3">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Matter Management</h1>
            <p className="text-sm text-muted-foreground">
              Organize and manage your legal matters and cases
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
            className="h-8 rounded-sm text-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Matter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-sm border bg-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-sm ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-semibold">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search matters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm rounded-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-8 text-sm rounded-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-sm">All Statuses</SelectItem>
            {MATTER_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value} className="text-sm">
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Matters Grid */}
      {matters.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-muted-foreground" />}
          title="No matters found"
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Create your first matter to start organizing your legal cases"
          }
          action={
            !searchQuery && statusFilter === "all" ? (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="h-8 rounded-sm text-sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Create Matter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {matters.map((matter) => (
            <div
              key={matter.id}
              className="group rounded-sm border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => router.push(`/matters/${matter.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {matter.name}
                  </h3>
                  {matter.matterNumber && (
                    <p className="text-[11px] text-muted-foreground">{matter.matterNumber}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/matters/${matter.id}`);
                      }}
                      className="text-xs"
                    >
                      <Eye className="h-3.5 w-3.5 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(matter);
                      }}
                      className="text-xs"
                    >
                      <Edit className="h-3.5 w-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMatter(matter);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-1.5 mb-3">
                {getStatusBadge(matter.status)}
                {matter.matterType && (
                  <Badge variant="outline" className="text-[10px] h-5">
                    {matter.matterType}
                  </Badge>
                )}
              </div>

              {matter.clientName && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {matter.clientName}
                    {matter.clientCompany && ` • ${matter.clientCompany}`}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{matter._count.documents} docs</span>
                </div>
                {matter.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(matter.dueDate), "MMM d")}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Create New Matter</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new legal matter or case to your organization
            </DialogDescription>
          </DialogHeader>
          {matterFormFields}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="h-8 rounded-sm text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateMatter}
              disabled={createMutation.isPending}
              className="h-8 rounded-sm text-sm"
            >
              {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Create Matter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Matter</DialogTitle>
            <DialogDescription className="text-sm">
              Update the matter details and information
            </DialogDescription>
          </DialogHeader>
          {matterFormFields}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedMatter(null);
              }}
              className="h-8 rounded-sm text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditMatter}
              disabled={updateMutation.isPending}
              className="h-8 rounded-sm text-sm"
            >
              {updateMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

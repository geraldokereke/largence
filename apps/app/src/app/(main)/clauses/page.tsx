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
  BookOpen,
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
  Tag,
  FileText,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Scale,
  Shield,
  Users,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";

interface Clause {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  jurisdiction: string | null;
  language: string;
  isPublic: boolean;
  usageCount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface ClausesResponse {
  clauses: Clause[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const CLAUSE_CATEGORIES = [
  { value: "indemnification", label: "Indemnification", icon: Shield },
  { value: "confidentiality", label: "Confidentiality", icon: FileText },
  { value: "termination", label: "Termination", icon: Clock },
  { value: "limitation_of_liability", label: "Limitation of Liability", icon: Scale },
  { value: "intellectual_property", label: "Intellectual Property", icon: BookOpen },
  { value: "dispute_resolution", label: "Dispute Resolution", icon: Users },
  { value: "governing_law", label: "Governing Law", icon: Scale },
  { value: "force_majeure", label: "Force Majeure", icon: AlertTriangle },
  { value: "payment_terms", label: "Payment Terms", icon: Clock },
  { value: "warranty", label: "Warranty", icon: Shield },
  { value: "other", label: "Other", icon: Tag },
];

const COMMON_JURISDICTIONS = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Egypt",
  "Tanzania",
  "United Kingdom",
  "Uganda",
  "Rwanda",
  "Ethiopia",
  "Côte d'Ivoire",
];

async function fetchClauses(search?: string, category?: string): Promise<ClausesResponse> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category && category !== "all") params.set("category", category);

  const response = await fetch(`/api/clauses?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch clauses");
  return response.json();
}

async function createClause(data: Record<string, unknown>): Promise<Clause> {
  const response = await fetch("/api/clauses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create clause");
  return response.json();
}

async function updateClause(id: string, data: Record<string, unknown>): Promise<Clause> {
  const response = await fetch(`/api/clauses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update clause");
  return response.json();
}

async function deleteClause(id: string): Promise<void> {
  const response = await fetch(`/api/clauses/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete clause");
}

export default function ClausesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    jurisdiction: "",
    language: "en",
    isPublic: false,
  });

  // Fetch clauses with React Query
  const {
    data: clausesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["clauses", searchQuery, categoryFilter],
    queryFn: () => fetchClauses(searchQuery, categoryFilter),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createClause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clauses"] });
      toast.success("Clause created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create clause");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateClause(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clauses"] });
      toast.success("Clause updated successfully");
      setIsEditDialogOpen(false);
      setSelectedClause(null);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to update clause");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteClause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clauses"] });
      toast.success("Clause deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete clause");
    },
  });

  const clauses = clausesData?.clauses || [];

  // Calculate stats
  const stats = useMemo(() => {
    const totalUsage = clauses.reduce((acc, c) => acc + c.usageCount, 0);
    const categories = new Set(clauses.map((c) => c.category).filter(Boolean)).size;
    const publicClauses = clauses.filter((c) => c.isPublic).length;
    return { total: clauses.length, totalUsage, categories, publicClauses };
  }, [clauses]);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      tags: "",
      jurisdiction: "",
      language: "en",
      isPublic: false,
    });
  };

  const handleCreateClause = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    createMutation.mutate({ ...formData, tags });
  };

  const handleEditClause = () => {
    if (!selectedClause || !formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    updateMutation.mutate({ id: selectedClause.id, data: { ...formData, tags } });
  };

  const handleDeleteClause = (clause: Clause) => {
    if (!confirm(`Are you sure you want to delete "${clause.title}"?`)) return;
    deleteMutation.mutate(clause.id);
  };

  const copyClauseContent = (clause: Clause) => {
    navigator.clipboard.writeText(clause.content);
    toast.success("Clause copied to clipboard");
  };

  const openEditDialog = (clause: Clause) => {
    setSelectedClause(clause);
    setFormData({
      title: clause.title,
      content: clause.content,
      category: clause.category || "",
      tags: clause.tags.join(", "),
      jurisdiction: clause.jurisdiction || "",
      language: clause.language,
      isPublic: clause.isPublic,
    });
    setIsEditDialogOpen(true);
  };

  const getCategoryIcon = (category: string | null) => {
    const cat = CLAUSE_CATEGORIES.find((c) => c.value === category);
    if (!cat) return Tag;
    return cat.icon;
  };

  const getCategoryLabel = (category: string | null) => {
    const cat = CLAUSE_CATEGORIES.find((c) => c.value === category);
    return cat?.label || category || "Uncategorized";
  };

  const statCards = [
    {
      label: "Total Clauses",
      value: stats.total.toString(),
      change: "In your library",
      icon: BookOpen,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Categories",
      value: stats.categories.toString(),
      change: "Different types",
      icon: Tag,
      color: "text-purple-600 bg-purple-500/10",
    },
    {
      label: "Total Usage",
      value: stats.totalUsage.toString(),
      change: "Times used",
      icon: Copy,
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      label: "Public",
      value: stats.publicClauses.toString(),
      change: "Shared clauses",
      icon: Users,
      color: "text-green-600 bg-green-500/10",
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
              <Skeleton className="h-7 w-40 mb-1" />
              <Skeleton className="h-4 w-80" />
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

        {/* Clause Cards Skeleton */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-sm border bg-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <Skeleton className="h-8 w-8 rounded-sm" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-6" />
              </div>
              <Skeleton className="h-10 w-full mb-3" />
              <div className="flex gap-1.5 mb-3">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-5 w-16" />
              </div>
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
        <h2 className="text-base font-semibold mb-1.5">Failed to load clauses</h2>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error loading your clause library.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="rounded-sm h-8 text-sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const clauseFormFields = (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Standard Indemnification Clause"
          className="h-8 text-sm rounded-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content" className="text-xs">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter the clause text..."
          rows={6}
          className="text-sm rounded-sm resize-none font-mono"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-xs">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className="h-8 text-sm rounded-sm">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CLAUSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-sm">
                  <div className="flex items-center gap-2">
                    <cat.icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jurisdiction" className="text-xs">Jurisdiction</Label>
          <Select
            value={formData.jurisdiction}
            onValueChange={(value) => setFormData({ ...formData, jurisdiction: value })}
          >
            <SelectTrigger className="h-8 text-sm rounded-sm">
              <SelectValue placeholder="Select jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_JURISDICTIONS.map((jur) => (
                <SelectItem key={jur} value={jur} className="text-sm">
                  {jur}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tags" className="text-xs">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="e.g., contract, liability, standard"
          className="h-8 text-sm rounded-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={formData.isPublic}
          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
          className="h-4 w-4 rounded-sm border"
        />
        <Label htmlFor="isPublic" className="text-xs cursor-pointer">
          Make this clause public (shareable with team)
        </Label>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col p-3">
      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <div>
            <h1 className="text-xl font-semibold font-display">Clause Library</h1>
            <p className="text-sm text-muted-foreground">
              Manage and reuse standard legal clauses across your documents
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
            className="h-8 rounded-sm text-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Clause
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
            placeholder="Search clauses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm rounded-sm"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44 h-8 text-sm rounded-sm">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-sm">All Categories</SelectItem>
            {CLAUSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value} className="text-sm">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clauses Grid */}
      {clauses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
          title="No clauses found"
          description={
            searchQuery || categoryFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Create your first clause to start building your library"
          }
          action={
            !searchQuery && categoryFilter === "all" ? (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="h-8 rounded-sm text-sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Create Clause
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {clauses.map((clause) => {
            const CategoryIcon = getCategoryIcon(clause.category);
            return (
              <div
                key={clause.id}
                className="group rounded-sm border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-sm bg-muted">
                      <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium truncate">{clause.title}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {getCategoryLabel(clause.category)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => copyClauseContent(clause)} className="text-xs">
                        <Copy className="h-3.5 w-3.5 mr-2" />
                        Copy Text
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(clause)} className="text-xs">
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive text-xs"
                        onClick={() => handleDeleteClause(clause)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{clause.content}</p>

                {clause.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {clause.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={`${clause.id}-tag-${tagIndex}`} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                        {tag}
                      </span>
                    ))}
                    {clause.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border">
                        +{clause.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                    <span>Used {clause.usageCount}x</span>
                  </div>
                  <span>{format(new Date(clause.updatedAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Create New Clause</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new reusable clause to your library
            </DialogDescription>
          </DialogHeader>
          {clauseFormFields}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="h-8 rounded-sm text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClause}
              disabled={createMutation.isPending}
              className="h-8 rounded-sm text-sm"
            >
              Create Clause
              {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 ml-1.5 animate-spin" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Clause</DialogTitle>
            <DialogDescription className="text-sm">
              Update the clause details and content
            </DialogDescription>
          </DialogHeader>
          {clauseFormFields}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedClause(null);
              }}
              className="h-8 rounded-sm text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditClause}
              disabled={updateMutation.isPending}
              className="h-8 rounded-sm text-sm"
            >
              Save Changes
              {updateMutation.isPending && <Loader2 className="h-3.5 w-3.5 ml-1.5 animate-spin" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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
  _count: {
    documents: number;
  };
}

const MATTER_STATUSES = [
  { value: "ACTIVE", label: "Active", color: "bg-green-500" },
  { value: "PENDING", label: "Pending", color: "bg-yellow-500" },
  { value: "ON_HOLD", label: "On Hold", color: "bg-orange-500" },
  { value: "CLOSED", label: "Closed", color: "bg-gray-500" },
  { value: "ARCHIVED", label: "Archived", color: "bg-gray-400" },
];

const BILLING_TYPE_LABELS: Record<string, string> = {
  HOURLY: "Hourly",
  FLAT_FEE: "Flat Fee",
  CONTINGENCY: "Contingency",
  RETAINER: "Retainer",
  PRO_BONO: "Pro Bono",
};

export default function MatterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMatter();
  }, [id]);

  const fetchMatter = async () => {
    try {
      const response = await fetch(`/api/matters/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMatter(data);
        setNewStatus(data.status);
      } else if (response.status === 404) {
        toast.error("Matter not found");
        router.push("/matters");
      }
    } catch (error) {
      console.error("Error fetching matter:", error);
      toast.error("Failed to load matter");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!matter) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/matters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === "CLOSED" && { closeDate: new Date().toISOString() }),
        }),
      });

      if (response.ok) {
        toast.success("Status updated successfully");
        setIsStatusDialogOpen(false);
        fetchMatter();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMatter = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${matter?.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/matters/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Matter deleted successfully");
        router.push("/matters");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete matter");
      }
    } catch (error) {
      console.error("Error deleting matter:", error);
      toast.error("Failed to delete matter");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = MATTER_STATUSES.find((s) => s.value === status);
    return (
      <Badge
        variant="secondary"
        className={`${statusConfig?.color || "bg-gray-500"} text-white`}
      >
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500";
      case "DRAFT":
        return "bg-yellow-500";
      case "ARCHIVED":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-3">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-8 w-8 rounded-sm" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-sm border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <Skeleton className="h-8 w-8 rounded-sm" />
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-sm border bg-card p-4">
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!matter) {
    return null;
  }

  const stats = [
    {
      label: "Documents",
      value: matter._count.documents,
      icon: FileText,
      change: "Total files",
    },
    {
      label: "Status",
      value: MATTER_STATUSES.find((s) => s.value === matter.status)?.label || matter.status,
      icon: Clock,
      change: `Since ${format(new Date(matter.openDate), "MMM d")}`,
    },
    {
      label: "Billing Type",
      value: BILLING_TYPE_LABELS[matter.billingType] || matter.billingType,
      icon: Receipt,
      change: matter.hourlyRate ? `$${matter.hourlyRate}/hr` : matter.flatFee ? `$${matter.flatFee.toLocaleString()}` : "N/A",
    },
    {
      label: "Due Date",
      value: matter.dueDate ? format(new Date(matter.dueDate), "MMM d") : "None",
      icon: Calendar,
      change: matter.dueDate ? format(new Date(matter.dueDate), "yyyy") : "No deadline",
    },
  ];

  return (
    <div className="flex flex-1 flex-col p-3">
      {/* Compact Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push("/matters")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold truncate">{matter.name}</h1>
            {getStatusBadge(matter.status)}
          </div>
          {matter.matterNumber && (
            <p className="text-xs text-muted-foreground">{matter.matterNumber}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/documents/new?matterId=${id}`)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Document
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsStatusDialogOpen(true)}>
                <Clock className="h-4 w-4 mr-2" />
                Change Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/matters/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Matter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteMatter}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Matter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {matter.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{matter.description}</p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-sm border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-semibold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {/* Client Information */}
        <div className="rounded-sm border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Client</h3>
          </div>
          {matter.clientName ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{matter.clientName}</span>
              </div>
              {matter.clientCompany && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-3.5 w-3.5" />
                  <span>{matter.clientCompany}</span>
                </div>
              )}
              {matter.clientEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <a href={`mailto:${matter.clientEmail}`} className="hover:text-primary truncate">
                    {matter.clientEmail}
                  </a>
                </div>
              )}
              {matter.clientPhone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <a href={`tel:${matter.clientPhone}`} className="hover:text-primary">
                    {matter.clientPhone}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No client info</p>
          )}
        </div>

        {/* Matter Details */}
        <div className="rounded-sm border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium">{matter.matterType || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Practice</p>
              <p className="font-medium">{matter.practiceArea || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Opened</p>
              <p className="font-medium">{format(new Date(matter.openDate), "MMM d, yyyy")}</p>
            </div>
            {matter.closeDate && (
              <div>
                <p className="text-xs text-muted-foreground">Closed</p>
                <p className="font-medium">{format(new Date(matter.closeDate), "MMM d, yyyy")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-sm border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Notes</h3>
          </div>
          {matter.notes ? (
            <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{matter.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No notes added</p>
          )}
        </div>
      </div>

      {/* Documents Section */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Documents ({matter._count.documents})</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/documents/new?matterId=${id}`)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add
          </Button>
        </div>

        {matter.documents.length === 0 ? (
          <div className="rounded-sm border bg-card p-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">No documents</p>
            <p className="text-xs text-muted-foreground mb-3">Create your first document</p>
            <Button size="sm" onClick={() => router.push(`/documents/new?matterId=${id}`)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Document
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {matter.documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-sm border bg-card p-3 hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between"
                onClick={() => router.push(`/documents/${doc.id}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="secondary"
                    className={`${getDocumentStatusColor(doc.status)} text-white text-xs`}
                  >
                    {doc.status}
                  </Badge>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Matter Status</DialogTitle>
            <DialogDescription>
              Update the status of this matter
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              {getStatusBadge(matter.status)}
            </div>
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATTER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={isSubmitting || newStatus === matter.status}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

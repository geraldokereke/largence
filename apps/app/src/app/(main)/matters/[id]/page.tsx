"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  DollarSign,
  Edit,
  Trash2,
  Loader2,
  Plus,
  Clock,
  ExternalLink,
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
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!matter) {
    return null;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/matters")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {matter.name}
                </h1>
                {getStatusBadge(matter.status)}
              </div>
              {matter.matterNumber && (
                <p className="text-sm text-muted-foreground">
                  {matter.matterNumber}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsStatusDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Change Status
          </Button>
          <Button variant="outline" onClick={() => router.push(`/matters/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDeleteMatter}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {matter.description && (
        <p className="text-muted-foreground max-w-3xl">{matter.description}</p>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({matter._count.documents})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matter.clientName ? (
                  <>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{matter.clientName}</span>
                    </div>
                    {matter.clientCompany && (
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{matter.clientCompany}</span>
                      </div>
                    )}
                    {matter.clientEmail && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`mailto:${matter.clientEmail}`}
                          className="text-primary hover:underline"
                        >
                          {matter.clientEmail}
                        </a>
                      </div>
                    )}
                    {matter.clientPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${matter.clientPhone}`}
                          className="text-primary hover:underline"
                        >
                          {matter.clientPhone}
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No client information added
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Matter Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5" />
                  Matter Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">
                      {matter.matterType || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Practice Area</p>
                    <p className="font-medium">
                      {matter.practiceArea || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Opened</p>
                    <p className="font-medium">
                      {format(new Date(matter.openDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  {matter.dueDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">
                        {format(new Date(matter.dueDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  )}
                  {matter.closeDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Closed</p>
                      <p className="font-medium">
                        {format(new Date(matter.closeDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Type</p>
                    <p className="font-medium">
                      {BILLING_TYPE_LABELS[matter.billingType] ||
                        matter.billingType}
                    </p>
                  </div>
                  {matter.hourlyRate && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Hourly Rate
                      </p>
                      <p className="font-medium">
                        ${matter.hourlyRate.toFixed(2)}/hr
                      </p>
                    </div>
                  )}
                  {matter.flatFee && (
                    <div>
                      <p className="text-sm text-muted-foreground">Flat Fee</p>
                      <p className="font-medium">
                        ${matter.flatFee.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {matter.retainerAmount && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Retainer Amount
                      </p>
                      <p className="font-medium">
                        ${matter.retainerAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {matter.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{matter.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Documents associated with this matter
            </p>
            <Button onClick={() => router.push(`/documents/new?matterId=${id}`)}>
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>

          {matter.documents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No documents yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first document for this matter
                </p>
                <Button
                  onClick={() => router.push(`/documents/new?matterId=${id}`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {matter.documents.map((doc) => (
                <Card
                  key={doc.id}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/documents/${doc.id}`)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={`${getDocumentStatusColor(doc.status)} text-white`}
                      >
                        {doc.status}
                      </Badge>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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

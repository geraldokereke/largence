"use client";

import { useState } from "react";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Crown,
  Shield,
  UserCheck,
  TrendingUp,
  FileText,
  Clock,
  Award,
  Mail,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useOrganization } from "@clerk/nextjs";
import { InviteMemberDialog } from "@largence/components/invite-member-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@largence/components/ui/avatar";
import { Skeleton } from "@largence/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const { organization, membership: currentMembership } = useOrganization();
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [invitationToRevoke, setInvitationToRevoke] = useState<{
    id: string;
    email: string;
  } | null>(null);

  // Fetch memberships with React Query
  const { data: membershipsData, isLoading: membershipsLoading } = useQuery({
    queryKey: ["organization-memberships", organization?.id],
    queryFn: async () => {
      if (!organization) return null;
      const memberships = await organization.getMemberships({ pageSize: 50 });
      return memberships;
    },
    enabled: !!organization,
  });

  // Fetch invitations with React Query - only pending ones
  const { data: invitationsData, isLoading: invitationsLoading } = useQuery({
    queryKey: ["organization-invitations", organization?.id],
    queryFn: async () => {
      if (!organization) return null;
      const invitations = await organization.getInvitations({ 
        pageSize: 20,
        status: ["pending"],
      });
      return invitations;
    },
    enabled: !!organization,
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      if (!organization) throw new Error("No organization");
      await organization.removeMember(membershipId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-memberships"] });
      toast.success("Member removed", {
        description: "The member has been removed from the organization.",
      });
    },
    onError: (error) => {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member", {
        description: "Please try again.",
      });
    },
  });

  // Revoke invitation mutation
  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const invitation = invitationsData?.data?.find(
        (inv) => inv.id === invitationId,
      );
      if (!invitation) throw new Error("Invitation not found");
      await invitation.revoke();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-invitations"] });
      toast.success("Invitation revoked", {
        description: "The invitation has been revoked.",
      });
      setRevokeModalOpen(false);
      setInvitationToRevoke(null);
    },
    onError: (error: any) => {
      console.error("Error revoking invitation:", error);
      // Check for specific Clerk error codes
      const errorCode = error?.errors?.[0]?.code || error?.code;
      const isExpiredOrNotPending = 
        errorCode === "organization_invitation_not_pending" ||
        error?.message?.includes("not pending");
      
      if (isExpiredOrNotPending) {
        toast.error("Invitation expired or already used", {
          description: "This invitation is no longer pending. Refreshing the list...",
        });
        // Refresh the invitations list to remove stale invitations
        queryClient.invalidateQueries({ queryKey: ["organization-invitations"] });
      } else {
        toast.error("Failed to revoke invitation", {
          description: "Please try again.",
        });
      }
      setRevokeModalOpen(false);
      setInvitationToRevoke(null);
    },
  });

  const isAdmin = currentMembership?.role === "org:admin";
  const isLoading = membershipsLoading || invitationsLoading;
  const totalMembers = membershipsData?.total_count || 0;
  const pendingInvites = invitationsData?.total_count || 0;
  const memberships = membershipsData?.data || [];
  const invitations = invitationsData?.data || [];

  const handleRemoveMember = async (membershipId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    removeMemberMutation.mutate(membershipId);
  };

  const handleRevokeInvitation = (invitationId: string, email: string) => {
    setInvitationToRevoke({ id: invitationId, email });
    setRevokeModalOpen(true);
  };

  const confirmRevokeInvitation = () => {
    if (invitationToRevoke) {
      revokeInvitationMutation.mutate(invitationToRevoke.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <Skeleton className="h-7 w-32 mb-1" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-8 w-40" />
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
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>

        {/* Search Skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Members Table Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-5 w-48 mb-3" />
          <div className="rounded-sm border bg-card">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b bg-muted/50">
              <Skeleton className="col-span-4 h-4" />
              <Skeleton className="col-span-3 h-4" />
              <Skeleton className="col-span-2 h-4" />
              <Skeleton className="col-span-2 h-4" />
            </div>
            <div className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-12 gap-3 px-4 py-3">
                  <div className="col-span-4 flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <Skeleton className="h-7 w-7 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-3">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold font-display">Teams</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage teams, members, and collaborate on legal work across{" "}
              {organization?.name}
            </p>
          </div>
          <InviteMemberDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="rounded-sm border bg-card p-4 hover:bg-accent/5 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <div className="p-1.5 rounded-sm bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Members</p>
            <p className="text-2xl font-semibold font-heading">
              {totalMembers}
            </p>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </div>
        </div>

        <div className="rounded-sm border bg-card p-4 hover:bg-accent/5 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <div className="p-1.5 rounded-sm bg-primary/10">
              <Mail className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pending Invites</p>
            <p className="text-2xl font-semibold font-heading">
              {pendingInvites}
            </p>
            <p className="text-xs text-muted-foreground">Awaiting acceptance</p>
          </div>
        </div>

        <div className="rounded-sm border bg-card p-4 hover:bg-accent/5 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <div className="p-1.5 rounded-sm bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-2xl font-semibold font-heading">
              {memberships.filter((m) => m.role === "org:admin").length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Organization admins</p>
          </div>
        </div>

        <div className="rounded-sm border bg-card p-4 hover:bg-accent/5 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <div className="p-1.5 rounded-sm bg-primary/10">
              <Award className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Your Role</p>
            <p className="text-base font-semibold font-heading">
              {currentMembership?.role === "org:admin" ? "Admin" : "Member"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Full access" : "Standard access"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams or members..."
            className="h-8 rounded-sm pl-9 text-sm"
          />
        </div>
        <Button variant="outline" className="h-8 rounded-sm text-sm">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold mb-3 font-heading">
          Organization Members
        </h2>
        <div className="rounded-sm border bg-card">
          <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
            <div className="col-span-4">Member</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y">
            {memberships.map((membership) => {
              const userData = membership.publicUserData;
              if (!userData) return null;

              return (
                <div
                  key={membership.id}
                  className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-accent/5 transition-colors"
                >
                  {/* Member */}
                  <div className="col-span-4 flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userData.imageUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {userData.firstName?.[0]}
                        {userData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{userData.identifier}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-span-3 flex items-center">
                    <span className="text-sm text-muted-foreground truncate">
                      {userData.identifier}
                    </span>
                  </div>

                  {/* Role */}
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center gap-2">
                      {membership.role === "org:admin" ? (
                        <>
                          <Crown className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium">Admin</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Member</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Joined */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-muted-foreground">
                      {new Date(membership.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end">
                    {isAdmin &&
                      userData.userId !==
                        currentMembership?.publicUserData?.userId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-sm"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(membership.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvites > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 font-heading">
            Pending Invitations
          </h2>
          <div className="rounded-sm border bg-card">
            <div className="divide-y">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {invitation.emailAddress}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Invited{" "}
                        {new Date(invitation.createdAt).toLocaleDateString()} •{" "}
                        {invitation.role === "org:admin" ? "Admin" : "Member"}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeInvitation(invitation.id, invitation.emailAddress)}
                      className="text-destructive hover:text-destructive"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revoke Invitation Confirmation Modal */}
      <Dialog open={revokeModalOpen} onOpenChange={setRevokeModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Revoke Invitation</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to revoke the invitation sent to{" "}
              <span className="font-medium text-foreground">
                {invitationToRevoke?.email}
              </span>
              ? This action cannot be undone and they will need to be invited again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setRevokeModalOpen(false);
                setInvitationToRevoke(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRevokeInvitation}
              disabled={revokeInvitationMutation.isPending}
            >
              {revokeInvitationMutation.isPending ? "Revoking..." : "Revoke Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Loader2,
  Trash2,
  Eye,
  Edit,
  MessageSquare,
  Shield,
  UserPlus,
  Check,
  ChevronsUpDown,
  Users,
  Lock,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

interface Collaborator {
  id: string;
  userId: string;
  permission: string;
  createdAt: string;
  // Populated from Clerk
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

interface TeamMember {
  id: string;
  userId: string;
  publicUserData: {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    identifier: string;
  };
  role: string;
}

interface TeamCollaboratorsProps {
  documentId: string;
  isOwner: boolean;
  currentVisibility?: string;
  onVisibilityChange?: (visibility: string) => void;
}

const PERMISSIONS = [
  { value: "VIEW", label: "View", icon: Eye, description: "Can only view" },
  { value: "COMMENT", label: "Comment", icon: MessageSquare, description: "Can add comments" },
  { value: "EDIT", label: "Edit", icon: Edit, description: "Can make changes" },
  { value: "ADMIN", label: "Admin", icon: Shield, description: "Full access" },
];

export function TeamCollaborators({
  documentId,
  isOwner,
  currentVisibility = "PRIVATE",
  onVisibilityChange,
}: TeamCollaboratorsProps) {
  const { organization, membership } = useOrganization();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [newPermission, setNewPermission] = useState("VIEW");
  const [memberSelectOpen, setMemberSelectOpen] = useState(false);

  useEffect(() => {
    fetchCollaborators();
    fetchTeamMembers();
  }, [documentId, organization]);

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/collaborators`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators || []);
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }
  };

  const fetchTeamMembers = async () => {
    if (!organization) return;
    try {
      const memberships = await organization.getMemberships({ pageSize: 50 });
      setTeamMembers(memberships.data as unknown as TeamMember[]);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const handleAddCollaborator = async () => {
    if (!selectedMember) return;

    setAddingMember(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collaboratorUserId: selectedMember,
          permission: newPermission,
        }),
      });

      if (response.ok) {
        toast.success("Collaborator added", {
          description: "Team member has been added to this document.",
        });
        fetchCollaborators();
        setSelectedMember(null);
        setNewPermission("VIEW");
        setMemberSelectOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to add collaborator");
      }
    } catch (error) {
      console.error("Error adding collaborator:", error);
      toast.error("Failed to add collaborator");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/collaborators?collaboratorId=${collaboratorId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast.success("Collaborator removed");
        setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
      } else {
        toast.error("Failed to remove collaborator");
      }
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast.error("Failed to remove collaborator");
    }
  };

  const handleUpdatePermission = async (collaboratorId: string, permission: string) => {
    try {
      const collaborator = collaborators.find((c) => c.id === collaboratorId);
      if (!collaborator) return;

      const response = await fetch(`/api/documents/${documentId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collaboratorUserId: collaborator.userId,
          permission,
        }),
      });

      if (response.ok) {
        toast.success("Permission updated");
        setCollaborators((prev) =>
          prev.map((c) => (c.id === collaboratorId ? { ...c, permission } : c))
        );
      }
    } catch (error) {
      console.error("Error updating permission:", error);
    }
  };

  const getPermissionIcon = (perm: string) => {
    const config = PERMISSIONS.find((p) => p.value === perm);
    const Icon = config?.icon || Eye;
    return <Icon className="h-3 w-3" />;
  };

  const getMemberName = (member: TeamMember) => {
    const { firstName, lastName, identifier } = member.publicUserData;
    if (firstName || lastName) {
      return `${firstName || ""} ${lastName || ""}`.trim();
    }
    return identifier;
  };

  const getMemberInitials = (member: TeamMember) => {
    const { firstName, lastName, identifier } = member.publicUserData;
    if (firstName || lastName) {
      return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    }
    return identifier[0]?.toUpperCase() || "?";
  };

  // Filter out existing collaborators from team members list
  const availableMembers = teamMembers.filter(
    (m) => !collaborators.some((c) => c.userId === m.userId)
  );

  if (!organization) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Join an organization to collaborate with team members.
      </div>
    );
  }

  const VISIBILITY_OPTIONS = [
    { value: "PRIVATE", label: "Private", icon: Lock, description: "Only you can access" },
    { value: "SHARED", label: "Shared", icon: UserPlus, description: "Specific collaborators only" },
    { value: "TEAM", label: "Team", icon: Users, description: "All team members can view" },
  ];

  const currentVisibilityOption = VISIBILITY_OPTIONS.find(v => v.value === currentVisibility);

  return (
    <div className="space-y-6">
      {/* Visibility Toggle */}
      {isOwner && onVisibilityChange && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Document Visibility</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Control who can access this document
              </p>
            </div>
            {currentVisibilityOption && (
              <Badge variant="outline" className="gap-1.5">
                <currentVisibilityOption.icon className="h-3 w-3" />
                {currentVisibilityOption.label}
              </Badge>
            )}
          </div>
          
          <div className="grid gap-2">
            {VISIBILITY_OPTIONS.map((option) => {
              const isSelected = currentVisibility === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onVisibilityChange(option.value)}
                  className={`flex items-center gap-3 p-3 rounded-md border text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-transparent bg-background hover:bg-muted/50"
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <option.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
          
          {currentVisibility === "TEAM" && (
            <p className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md px-3 py-2">
              All {teamMembers.length} team members in {organization.name} can view this document.
            </p>
          )}
        </div>
      )}

      {/* Add Collaborator */}
      {isOwner && currentVisibility !== "TEAM" && (
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Add Team Member</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Invite team members to collaborate on this document
            </p>
          </div>
          <div className="flex gap-2">
            <Popover open={memberSelectOpen} onOpenChange={setMemberSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={memberSelectOpen}
                  className="flex-1 justify-between"
                >
                  {selectedMember ? (
                    <span className="truncate">
                      {getMemberName(
                        teamMembers.find((m) => m.userId === selectedMember)!
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select team member...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search team members..." />
                  <CommandList>
                    <CommandEmpty>No team members found.</CommandEmpty>
                    <CommandGroup>
                      {availableMembers.map((member) => (
                        <CommandItem
                          key={member.userId}
                          value={member.userId}
                          onSelect={() => {
                            setSelectedMember(member.userId);
                            setMemberSelectOpen(false);
                          }}
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={member.publicUserData.imageUrl} />
                            <AvatarFallback className="text-xs">
                              {getMemberInitials(member)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 truncate">
                            <div className="text-sm">{getMemberName(member)}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {member.publicUserData.identifier}
                            </div>
                          </div>
                          {selectedMember === member.userId && (
                            <Check className="h-4 w-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Select value={newPermission} onValueChange={setNewPermission}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERMISSIONS.map((perm) => (
                  <SelectItem key={perm.value} value={perm.value}>
                    <div className="flex items-center gap-1.5">
                      <perm.icon className="h-3 w-3" />
                      {perm.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleAddCollaborator}
              disabled={!selectedMember || addingMember}
              size="icon"
            >
              {addingMember ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Current Collaborators */}
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">
            Collaborators ({collaborators.length})
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            People with access to this document
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : collaborators.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {currentVisibility === "TEAM"
              ? "Team visibility is enabled. All team members can view this document."
              : "No collaborators added yet."}
          </p>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {collaborators.map((collaborator) => {
              const member = teamMembers.find((m) => m.userId === collaborator.userId);
              return (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member?.publicUserData.imageUrl} />
                      <AvatarFallback className="text-xs">
                        {member ? getMemberInitials(member) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member ? getMemberName(member) : collaborator.userId}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member?.publicUserData.identifier || ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <>
                        <Select
                          value={collaborator.permission}
                          onValueChange={(value) =>
                            handleUpdatePermission(collaborator.id, value)
                          }
                        >
                          <SelectTrigger className="h-7 w-[90px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PERMISSIONS.map((perm) => (
                              <SelectItem key={perm.value} value={perm.value}>
                                <div className="flex items-center gap-1.5">
                                  <perm.icon className="h-3 w-3" />
                                  {perm.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveCollaborator(collaborator.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Badge variant="outline" className="h-6 gap-1 text-xs">
                        {getPermissionIcon(collaborator.permission)}
                        {collaborator.permission}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

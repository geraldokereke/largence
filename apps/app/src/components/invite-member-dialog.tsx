"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@largence/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@largence/components/ui/dialog";
import { Input } from "@largence/components/ui/input";
import { Label } from "@largence/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@largence/components/ui/select";
import { Spinner } from "@largence/components/ui/spinner";
import { UserPlus, Mail, CheckCircle } from "lucide-react";

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"org:member" | "org:admin">("org:member");
  const [isInviting, setIsInviting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { organization, invitations } = useOrganization({
    invitations: {
      pageSize: 5,
      keepPreviousData: true,
    },
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setError(null);
    setSuccess(false);

    try {
      if (!organization) {
        throw new Error("No organization found");
      }

      await organization.inviteMember({
        emailAddress: email,
        role: role,
      });

      setSuccess(true);
      setEmail("");

      // Mark onboarding item as complete
      if (typeof window !== "undefined") {
        localStorage.setItem("onboarding:invited_team", "true");
        window.dispatchEvent(new CustomEvent("onboarding:progress"));
      }

      // Auto close after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Invite error:", err);
      setError(
        err?.errors?.[0]?.message ||
          "Failed to send invitation. Please try again.",
      );
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-sm">
          <UserPlus className="h-5 w-5" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-display">Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join {organization?.name}. They'll receive an
            email with instructions.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Invitation Sent!</h3>
            <p className="text-sm text-muted-foreground text-center">
              An invitation has been sent to {email}
            </p>
          </div>
        ) : (
          <form onSubmit={handleInvite}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isInviting}
                    className="h-10 rounded-sm pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(value: "org:member" | "org:admin") =>
                    setRole(value)
                  }
                  disabled={isInviting}
                >
                  <SelectTrigger className="h-10 rounded-sm">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org:member">Member</SelectItem>
                    <SelectItem value="org:admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {role === "org:admin"
                    ? "Admins can manage organization settings and members"
                    : "Members can access and collaborate on documents"}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isInviting}
                className="h-10 rounded-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isInviting || !email}
                className="h-10 rounded-sm"
              >
                {isInviting ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Sending...
                  </span>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

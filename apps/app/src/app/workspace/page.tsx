"use client";

import { useEffect, useState } from "react";
import { useUser, useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@largence/components/ui/button";
import { Spinner } from "@largence/components/ui/spinner";
import { Building2, ChevronRight, Plus, Shield, Users } from "lucide-react";

export default function SelectOrganizationPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const {
    userMemberships,
    isLoaded: membershipsLoaded,
    setActive,
  } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!userLoaded || !membershipsLoaded || !isClient) return;

    // If no memberships, redirect to onboarding to create one
    if (!userMemberships?.data || userMemberships.data.length === 0) {
      router.push("/onboarding");
    }
  }, [userLoaded, membershipsLoaded, isClient, userMemberships, router]);

  const handleSelectOrg = async (orgId: string, orgName: string) => {
    if (!setActive || isSelecting) return;

    setIsSelecting(true);
    try {
      await setActive({ organization: orgId });
      router.push("/");
    } catch (error) {
      console.error("Error setting active org:", error);
      setIsSelecting(false);
    }
  };

  const handleCreateNew = () => {
    router.push("/onboarding");
  };

  if (!isClient || !userLoaded || !membershipsLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="sm" />
      </div>
    );
  }

  if (!userMemberships?.data || userMemberships.data.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Largence Logo"
                width={32}
                height={32}
                className="shrink-0"
              />
              <span className="text-xl font-semibold tracking-tight font-heading">
                Largence
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-3 font-display">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select an organization to continue or create a new workspace
            </p>
          </div>

          {/* Organizations Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Your Organizations
              </h2>
              <span className="text-sm text-muted-foreground">
                {userMemberships.data.length}{" "}
                {userMemberships.data.length === 1
                  ? "organization"
                  : "organizations"}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userMemberships.data.map((membership) => {
                const org = membership.organization;
                const role = membership.role;
                const isAdmin = role === "org:admin";

                return (
                  <button
                    key={membership.id}
                    onClick={() => handleSelectOrg(org.id, org.name)}
                    disabled={isSelecting}
                    className="group relative p-6 text-left border border-border rounded-xl hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 bg-card disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Organization Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* Organization Name */}
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {org.name}
                    </h3>

                    {/* Role Badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          isAdmin
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {isAdmin ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        {role.replace("org:", "").charAt(0).toUpperCase() +
                          role.replace("org:", "").slice(1)}
                      </div>

                      {org.membersCount !== undefined && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
                          <Users className="w-3 h-3" />
                          {org.membersCount}{" "}
                          {org.membersCount === 1 ? "member" : "members"}
                        </div>
                      )}
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </button>
                );
              })}

              {/* Create New Organization Card */}
              <button
                onClick={handleCreateNew}
                disabled={isSelecting}
                className="group relative p-6 text-left border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted border border-border group-hover:border-primary group-hover:bg-primary/10 transition-all mb-4">
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    Create New Organization
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Set up a new workspace
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-12 p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Need help?</p>
                <p className="text-xs text-muted-foreground">
                  If you can't find your organization or need to be invited to
                  one, contact your organization administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {isSelecting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">
              Loading organization...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useUser, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Button } from "@largence/components/ui/button";
import { useRouter } from "next/navigation";

export default function DebugAuthPage() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const router = useRouter();

  const handleSetActiveOrg = async (orgId: string) => {
    if (!setActive) return;
    try {
      await setActive({ organization: orgId });
      alert("Organization set as active! Refreshing...");
      window.location.href = "/";
    } catch (error) {
      console.error("Error setting active org:", error);
      alert("Error: " + error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Auth Debug Page</h1>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">User Info</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Loaded: {userLoaded ? "✅" : "❌"}</div>
            <div>Signed In: {isSignedIn ? "✅" : "❌"}</div>
            <div>User ID: {user?.id || "None"}</div>
            <div>Email: {user?.emailAddresses[0]?.emailAddress || "None"}</div>
            <div>Name: {user?.fullName || "None"}</div>
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Organization Info</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Org Loaded: {orgLoaded ? "✅" : "❌"}</div>
            <div>Has Active Org: {organization ? "✅" : "❌"}</div>
            <div>Org ID: {organization?.id || "None"}</div>
            <div>Org Name: {organization?.name || "None"}</div>
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            All Organization Memberships
          </h2>
          <div className="space-y-2">
            {userMemberships?.data && userMemberships.data.length > 0 ? (
              userMemberships.data.map((membership) => (
                <div
                  key={membership.id}
                  className="border p-4 rounded space-y-2"
                >
                  <div className="font-semibold">
                    {membership.organization.name}
                  </div>
                  <div className="font-mono text-sm space-y-1">
                    <div>ID: {membership.organization.id}</div>
                    <div>Role: {membership.role}</div>
                    <div>
                      Active:{" "}
                      {organization?.id === membership.organization.id
                        ? "✅"
                        : "❌"}
                    </div>
                  </div>
                  {organization?.id !== membership.organization.id && (
                    <Button
                      onClick={() =>
                        handleSetActiveOrg(membership.organization.id)
                      }
                      size="sm"
                    >
                      Set as Active
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">
                No organization memberships found
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={() => router.push("/onboarding")}>
            Go to Onboarding
          </Button>
          <Button onClick={() => router.push("/")} variant="outline">
            Go to Home
          </Button>
          <Button
            onClick={() => {
              window.location.href = "/";
            }}
            variant="outline"
          >
            Hard Refresh Home
          </Button>
        </div>

        <div className="border rounded-lg p-6 bg-yellow-50 dark:bg-yellow-950">
          <h3 className="font-semibold mb-2">What to check:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              If you have org memberships but no active org, click "Set as
              Active"
            </li>
            <li>If middleware still redirects, check the middleware logs</li>
            <li>
              After setting active org, you should be able to access home page
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

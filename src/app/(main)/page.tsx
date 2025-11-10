import { WelcomeCTA } from "@largence/components/welcome-cta"
import { EmptyState } from "@largence/components/empty-state"
import { requireOrganization } from "@largence/lib/auth"

export default async function Home() {
  // Ensure user is authenticated and has an organization
  await requireOrganization()
  
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <WelcomeCTA />
      <EmptyState />
    </div>
  )
}

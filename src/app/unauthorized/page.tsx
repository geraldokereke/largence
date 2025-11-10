import { ShieldAlert } from "lucide-react"
import { Button } from "@largence/components/ui/button"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have access to this organization's workspace.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact your workspace administrator.
          </p>
          
          <Button asChild className="w-full">
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

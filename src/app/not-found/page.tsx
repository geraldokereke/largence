import { Building2 } from "lucide-react"
import { Button } from "@largence/components/ui/button"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-4">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Organization Not Found</h1>
          <p className="text-muted-foreground">
            The organization you're looking for doesn't exist or has been removed.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Please check the URL or contact support if you need assistance.
          </p>
          
          <Button asChild className="w-full">
            <Link href="/">Go to Main Site</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

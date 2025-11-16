import { Spinner } from "@largence/components/ui/spinner"

export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="sm" />
    </div>
  )
}

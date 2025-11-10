import { Spinner } from "@largence/components/ui/spinner"

export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-6 w-6 text-primary border-[3px]" />
    </div>
  )
}

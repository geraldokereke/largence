"use client"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex gap-2 justify-center pt-4">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div
          key={s}
          className={`h-2 w-12 rounded-full transition-all ${
            s === currentStep
              ? "bg-primary"
              : s < currentStep
              ? "bg-primary/30"
              : "bg-border"
          }`}
        />
      ))}
    </div>
  )
}

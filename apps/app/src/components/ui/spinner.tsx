import { cn } from "@largence/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white";
}

export function Spinner({
  size = "md",
  variant = "default",
  className,
  ...props
}: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  const variantClasses = {
    default: "border-primary border-r-transparent",
    white: "border-white border-r-transparent",
  };

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-solid align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      role="status"
      {...props}
    >
      <span className="absolute! -m-px! h-px! w-px! overflow-hidden! whitespace-nowrap! border-0! p-0! [clip:rect(0,0,0,0)]!">
        Loading...
      </span>
    </div>
  );
}

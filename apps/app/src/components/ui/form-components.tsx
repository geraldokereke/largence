import { forwardRef } from "react";
import { cn } from "@largence/lib/utils";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";

export const StyledInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn(
      "rounded-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-sm",
      className
    )}
    {...props}
  />
));
StyledInput.displayName = "StyledInput";

export const StyledButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn("w-full rounded-sm h-10 text-sm font-medium", className)}
    {...props}
  >
    {children}
  </Button>
));
StyledButton.displayName = "StyledButton";

interface InputWithIconProps extends React.ComponentProps<typeof StyledInput> {
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon, iconPosition = "left", className, ...props }, ref) => {
    const isLeftIcon = iconPosition === "left";
    const isRightIcon = iconPosition === "right";

    return (
      <div className="relative">
        {icon && (
          <div
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-muted-foreground",
              isLeftIcon && "left-3",
              isRightIcon && "right-3"
            )}
          >
            {icon}
          </div>
        )}
        <StyledInput
          ref={ref}
          className={cn(
            isLeftIcon && "pl-10 pr-4",
            isRightIcon && "px-4 pr-10",
            !icon && "px-4",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
InputWithIcon.displayName = "InputWithIcon";
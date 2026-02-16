import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-ring/70 focus:ring-offset-2 focus:ring-offset-background active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "border-primary/60 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary:
          "border-secondary/60 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90",
        destructive:
          "border-destructive/60 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border-border bg-transparent text-foreground hover:bg-accent/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

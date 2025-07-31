"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Base icon variant configuration
const iconVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      size: {
        sm: "h-4 w-4", // 16px
        md: "h-5 w-5", // 20px  
        lg: "h-6 w-6", // 24px
        xl: "h-8 w-8", // 32px
      },
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        primary: "text-primary",
        secondary: "text-secondary-foreground",
        success: "text-green-600",
        warning: "text-yellow-600",
        error: "text-red-600",
        info: "text-blue-600",
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface IconProps
  extends React.SVGAttributes<SVGElement>,
    VariantProps<typeof iconVariants> {
  children: React.ReactNode
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, variant, children, ...props }, ref) => {
    return (
      <div className={cn(iconVariants({ size, variant }), className)}>
        {React.cloneElement(children as React.ReactElement, {
          ref,
          className: "h-full w-full",
          strokeWidth: 2,
          ...props,
        })}
      </div>
    )
  }
)
Icon.displayName = "Icon"

export { Icon, iconVariants }
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text" | "card"
  animate?: boolean
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", animate = true, ...props }, ref) => {
    const variants = {
      default: "rounded-lg",
      circular: "rounded-full",
      text: "rounded-md h-4 w-full",
      card: "rounded-2xl h-32",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden bg-muted",
          variants[variant],
          animate && "after:absolute after:inset-0 after:translate-x-[-100%] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-[shimmer_2s_infinite]",
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

// Pre-built skeleton components
const SkeletonCard = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-4 rounded-2xl border bg-card p-6", className)} {...props}>
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" className="h-12 w-12" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-20" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
)

const SkeletonTable = ({ rows = 5, cols = 4, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { rows?: number; cols?: number }) => (
  <div className={cn("rounded-2xl border bg-card overflow-hidden", className)} {...props}>
    {/* Header */}
    <div className="flex gap-4 p-4 border-b bg-muted/50">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 p-4 border-b last:border-0">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
)

const SkeletonText = ({ lines = 3, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) => (
  <div className={cn("space-y-2", className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        className={cn("h-4", i === lines - 1 && "w-2/3")}
      />
    ))}
  </div>
)

const SkeletonAvatar = ({ size = "md", className, ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  }

  return (
    <Skeleton variant="circular" className={cn(sizes[size], className)} {...props} />
  )
}

const SkeletonStat = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-2xl border bg-card p-6 space-y-3", className)} {...props}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton variant="circular" className="h-10 w-10" />
    </div>
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-20" />
  </div>
)

export {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
  SkeletonAvatar,
  SkeletonStat,
}

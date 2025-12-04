"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-2xl text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border shadow-sm",
        elevated: "bg-card shadow-md hover:shadow-lg",
        outline: "border-2 bg-transparent",
        ghost: "bg-transparent",
        glass: "bg-white/70 backdrop-blur-xl border border-white/30 dark:bg-black/40 dark:border-white/10",
        gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-md",
        "gradient-brand": "bg-gradient-to-br from-[#F97402]/10 to-[#F13F33]/10 border border-[#F97402]/20",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md",
        false: "",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
      padding: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, interactive, padding }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

// Animated card with Framer Motion
interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "ref">, VariantProps<typeof cardVariants> {}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant, interactive, padding, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(cardVariants({ variant, interactive: false, padding }), className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={interactive ? { y: -4, boxShadow: "0 10px 20px -5px rgb(0 0 0 / 0.15)" } : undefined}
      {...props}
    />
  )
)
AnimatedCard.displayName = "AnimatedCard"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Stat Card for dashboard
interface StatCardProps extends CardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    positive?: boolean
  }
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, description, icon, trend, className, ...props }, ref) => (
    <Card
      ref={ref}
      variant="elevated"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.positive ? "text-emerald-600" : "text-red-600"
            )}>
              <span>{trend.positive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            {icon}
          </div>
        )}
      </div>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 pointer-events-none" />
    </Card>
  )
)
StatCard.displayName = "StatCard"

export {
  Card,
  AnimatedCard,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  cardVariants,
}

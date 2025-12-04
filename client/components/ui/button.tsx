"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          "bg-destructive text-white shadow-md hover:shadow-lg hover:bg-destructive/90 active:scale-[0.98] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-2 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/50 dark:bg-input/30 dark:border-input dark:hover:bg-input/50 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md active:scale-[0.98]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 active:scale-[0.98]",
        link:
          "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-md hover:shadow-lg hover:shadow-[#F97402]/25 active:scale-[0.98]",
        "gradient-outline":
          "bg-transparent border-2 border-[#F97402] text-[#F97402] hover:bg-[#F97402]/10 active:scale-[0.98]",
        glass:
          "bg-white/20 backdrop-blur-md border border-white/30 text-foreground hover:bg-white/30 dark:bg-black/20 dark:border-white/10 dark:hover:bg-black/30 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-lg gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-xl px-8 text-base has-[>svg]:px-5",
        xl: "h-14 rounded-2xl px-10 text-lg has-[>svg]:px-6",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!loading && rightIcon}
      </Comp>
    )
  }
)
Button.displayName = "Button"

// Animated button with Framer Motion for special interactions
interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "ref">, VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({
    className,
    variant,
    size,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!loading && rightIcon}
      </motion.button>
    )
  }
)
AnimatedButton.displayName = "AnimatedButton"

export { Button, AnimatedButton, buttonVariants }

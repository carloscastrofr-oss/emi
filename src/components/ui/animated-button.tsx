"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, type Variants } from "framer-motion"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Animation variants
const buttonAnimations: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

const shimmerAnimation: Variants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear",
    },
  },
}

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  success?: boolean
  successText?: string
  shimmer?: boolean
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      success = false,
      successText,
      shimmer = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <motion.div
        variants={buttonAnimations}
        initial="initial"
        whileHover={!isDisabled ? "hover" : undefined}
        whileTap={!isDisabled ? "tap" : undefined}
        className="inline-block"
      >
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            "relative overflow-hidden"
          )}
          ref={ref}
          disabled={isDisabled}
          {...props}
        >
          {/* Shimmer effect */}
          {shimmer && !loading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              variants={shimmerAnimation}
              initial="initial"
              animate="animate"
            />
          )}

          {/* Loading state */}
          {loading && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText || "Cargando..."}
            </motion.span>
          )}

          {/* Success state */}
          {success && !loading && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <motion.svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.svg>
              {successText || "¡Listo!"}
            </motion.span>
          )}

          {/* Normal state */}
          {!loading && !success && children}
        </Comp>
      </motion.div>
    )
  }
)
AnimatedButton.displayName = "AnimatedButton"

// ============================================================================
// ICON BUTTON WITH RIPPLE
// ============================================================================

interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ className, variant, size, asChild = false, children, onClick, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<
      { x: number; y: number; id: number }[]
    >([])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = Date.now()

      setRipples((prev) => [...prev, { x, y, id }])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 600)

      onClick?.(e)
    }

    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          "relative overflow-hidden"
        )}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              width: 200,
              height: 200,
              x: -100,
              y: -100,
              opacity: 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
        {children}
      </Comp>
    )
  }
)
RippleButton.displayName = "RippleButton"

// ============================================================================
// MAGNETIC BUTTON
// ============================================================================

interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  strength?: number
}

const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ className, variant, size, asChild = false, strength = 0.3, children, ...props }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement | null>(null)
    const [position, setPosition] = React.useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const x = (e.clientX - centerX) * strength
      const y = (e.clientY - centerY) * strength
      setPosition({ x, y })
    }

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 })
    }

    const Comp = asChild ? Slot : "button"

    return (
      <motion.div
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className="inline-block"
      >
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={(el) => {
            buttonRef.current = el
            if (typeof ref === "function") {
              ref(el)
            } else if (ref && el) {
              ;(ref as React.MutableRefObject<HTMLButtonElement | null>).current = el
            }
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          {children}
        </Comp>
      </motion.div>
    )
  }
)
MagneticButton.displayName = "MagneticButton"

// ============================================================================
// GLOW BUTTON
// ============================================================================

interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  glowColor?: string
}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    {
      className,
      variant = "default",
      size,
      asChild = false,
      glowColor = "hsl(var(--primary))",
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    return (
      <motion.div
        className="relative inline-block"
        whileHover="hover"
        initial="initial"
      >
        <motion.div
          className="absolute inset-0 rounded-md blur-md opacity-0"
          style={{ backgroundColor: glowColor }}
          variants={{
            initial: { opacity: 0 },
            hover: { opacity: 0.5 },
          }}
          transition={{ duration: 0.2 }}
        />
        <Comp
          className={cn(buttonVariants({ variant, size, className }), "relative")}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      </motion.div>
    )
  }
)
GlowButton.displayName = "GlowButton"

// ============================================================================
// BOUNCE BUTTON
// ============================================================================

interface BounceButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const BounceButton = React.forwardRef<HTMLButtonElement, BounceButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ y: 2 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
        className="inline-block"
      >
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      </motion.div>
    )
  }
)
BounceButton.displayName = "BounceButton"

// Export original button variants for custom use
export { buttonVariants }

export {
  AnimatedButton,
  RippleButton,
  MagneticButton,
  GlowButton,
  BounceButton,
}


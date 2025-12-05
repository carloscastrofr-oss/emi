"use client";

import * as React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: "easeIn" } },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: "easeIn" } },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2, ease: "easeIn" } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export const slideInFromBottom: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { type: "spring", damping: 30, stiffness: 300 },
  },
  exit: { y: "100%", transition: { duration: 0.2, ease: "easeIn" } },
};

export const slideInFromLeft: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 30, stiffness: 300 },
  },
  exit: { x: "-100%", transition: { duration: 0.2, ease: "easeIn" } },
};

export const slideInFromRight: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 30, stiffness: 300 },
  },
  exit: { x: "100%", transition: { duration: 0.2, ease: "easeIn" } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 400,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const shake: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
};

export const pulse: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.3 },
  },
};

// ============================================================================
// MOTION COMPONENTS
// ============================================================================

interface MotionDivProps extends React.HTMLAttributes<HTMLDivElement> {
  variants?: Variants;
  initial?: string;
  animate?: string;
  exit?: string;
  delay?: number;
}

export const MotionDiv = React.forwardRef<HTMLDivElement, MotionDivProps>(
  (
    {
      className,
      variants = fadeIn,
      initial = "hidden",
      animate = "visible",
      exit = "exit",
      delay = 0,
      ...props
    },
    ref
  ) => {
    const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;
    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        variants={variants}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={{ delay }}
        {...(motionProps as any)}
      />
    );
  }
);
MotionDiv.displayName = "MotionDiv";

interface MotionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  stagger?: number;
  delayChildren?: number;
}

export const MotionContainer = React.forwardRef<HTMLDivElement, MotionContainerProps>(
  ({ className, stagger = 0.1, delayChildren = 0.1, children, ...props }, ref) => {
    const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;
    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: stagger,
              delayChildren,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        {...(motionProps as any)}
      >
        {children}
      </motion.div>
    );
  }
);
MotionContainer.displayName = "MotionContainer";

interface MotionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "up" | "down" | "left" | "right" | "scale";
}

export const MotionItem = React.forwardRef<HTMLDivElement, MotionItemProps>(
  ({ className, direction = "up", children, ...props }, ref) => {
    const getVariants = (): Variants => {
      switch (direction) {
        case "down":
          return fadeInDown;
        case "left":
          return fadeInLeft;
        case "right":
          return fadeInRight;
        case "scale":
          return scaleIn;
        default:
          return fadeInUp;
      }
    };

    const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;
    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        variants={getVariants()}
        {...(motionProps as any)}
      >
        {children}
      </motion.div>
    );
  }
);
MotionItem.displayName = "MotionItem";

// ============================================================================
// ANIMATED PRESENCE WRAPPER
// ============================================================================

interface AnimatedPresenceProps {
  children: React.ReactNode;
  mode?: "wait" | "sync" | "popLayout";
  initial?: boolean;
}

export function AnimatedPresenceWrapper({
  children,
  mode = "wait",
  initial = true,
}: AnimatedPresenceProps) {
  return (
    <AnimatePresence mode={mode} initial={initial}>
      {children}
    </AnimatePresence>
  );
}

// ============================================================================
// PAGE TRANSITION WRAPPER
// ============================================================================

interface PageTransitionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageTransition({ children, className, ...props }: PageTransitionProps) {
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...(motionProps as any)}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// HOVER ANIMATIONS
// ============================================================================

interface HoverScaleProps extends React.HTMLAttributes<HTMLDivElement> {
  scale?: number;
}

export function HoverScale({ children, className, scale = 1.02, ...props }: HoverScaleProps) {
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;
  return (
    <motion.div
      className={cn(className)}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...(motionProps as any)}
    >
      {children}
    </motion.div>
  );
}

interface HoverLiftProps extends React.HTMLAttributes<HTMLDivElement> {
  lift?: number;
}

export function HoverLift({ children, className, lift = -4, ...props }: HoverLiftProps) {
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;
  return (
    <motion.div
      className={cn(className)}
      whileHover={{ y: lift }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...(motionProps as any)}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-current"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("h-5 w-5 rounded-full border-2 border-current border-t-transparent", className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

export function LoadingPulse({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("h-4 w-4 rounded-full bg-current", className)}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// ============================================================================
// COUNT ANIMATION
// ============================================================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1, className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const difference = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      setDisplayValue(Math.round(startValue + difference * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{displayValue}</span>;
}

// ============================================================================
// TEXT ANIMATION
// ============================================================================

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedText({ text, className, delay = 0 }: AnimatedTextProps) {
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.03,
            delayChildren: delay,
          },
        },
      }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4 },
            },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ============================================================================
// REVEAL ON SCROLL
// ============================================================================

interface RevealOnScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}

export function RevealOnScroll({
  children,
  className,
  direction = "up",
  delay = 0,
  ...props
}: RevealOnScrollProps) {
  const getInitial = () => {
    switch (direction) {
      case "down":
        return { opacity: 0, y: -50 };
      case "left":
        return { opacity: 0, x: 50 };
      case "right":
        return { opacity: 0, x: -50 };
      default:
        return { opacity: 0, y: 50 };
    }
  };

  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;
  return (
    <motion.div
      className={cn(className)}
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      {...(motionProps as any)}
    >
      {children}
    </motion.div>
  );
}

// Re-export framer-motion utilities
export { motion, AnimatePresence };

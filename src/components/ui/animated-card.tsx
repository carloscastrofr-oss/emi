"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// ============================================================================
// ANIMATED CARD VARIANTS
// ============================================================================

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const hoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 1px 2px rgba(0,0,0,.12)",
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 10px 30px rgba(0,0,0,.15)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
  },
  tap: {
    scale: 0.98,
  },
};

// ============================================================================
// ANIMATED CARD COMPONENTS
// ============================================================================

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  hover?: boolean;
  clickable?: boolean;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, delay = 0, hover = true, clickable = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={hover ? hoverVariants : cardVariants}
        initial={hover ? "rest" : "hidden"}
        animate={hover ? "rest" : "visible"}
        exit="exit"
        whileHover={hover ? "hover" : undefined}
        whileTap={clickable ? "tap" : undefined}
        transition={{ delay }}
      >
        <Card className={cn(clickable && "cursor-pointer", className)} {...props}>
          {children}
        </Card>
      </motion.div>
    );
  }
);
AnimatedCard.displayName = "AnimatedCard";

// Fade-in card without hover effects
interface FadeInCardProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

const FadeInCard = React.forwardRef<HTMLDivElement, FadeInCardProps>(
  ({ className, delay = 0, direction = "up", children, ...props }, ref) => {
    const getInitial = () => {
      switch (direction) {
        case "down":
          return { opacity: 0, y: -20 };
        case "left":
          return { opacity: 0, x: 20 };
        case "right":
          return { opacity: 0, x: -20 };
        default:
          return { opacity: 0, y: 20 };
      }
    };

    return (
      <motion.div
        ref={ref}
        initial={getInitial()}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={getInitial()}
        transition={{
          duration: 0.4,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        <Card className={className} {...props}>
          {children}
        </Card>
      </motion.div>
    );
  }
);
FadeInCard.displayName = "FadeInCard";

// Stagger card container for lists
interface CardContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  stagger?: number;
  delayChildren?: number;
}

const CardContainer = React.forwardRef<HTMLDivElement, CardContainerProps>(
  ({ className, stagger = 0.1, delayChildren = 0, children, ...props }, ref) => {
    const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;
    return (
      <motion.div
        ref={ref}
        className={cn("grid gap-4", className)}
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
CardContainer.displayName = "CardContainer";

// Card item for staggered animations
const CardItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;
    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        className={cn(className)}
        {...(motionProps as any)}
      >
        {children}
      </motion.div>
    );
  }
);
CardItem.displayName = "CardItem";

// Expandable card
interface ExpandableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  expanded?: boolean;
  onToggle?: () => void;
}

const ExpandableCard = React.forwardRef<HTMLDivElement, ExpandableCardProps>(
  ({ className, expanded = false, onToggle, children, ...props }, ref) => {
    const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;
    return (
      <motion.div
        ref={ref}
        layout
        onClick={onToggle}
        className={cn("cursor-pointer", className)}
        {...(motionProps as any)}
      >
        <Card className="overflow-hidden">
          <motion.div layout="position">{children}</motion.div>
        </Card>
      </motion.div>
    );
  }
);
ExpandableCard.displayName = "ExpandableCard";

// Flip card
interface FlipCardProps extends React.HTMLAttributes<HTMLDivElement> {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped?: boolean;
}

const FlipCard = React.forwardRef<HTMLDivElement, FlipCardProps>(
  ({ className, front, back, flipped = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("perspective-1000", className)}
        style={{ perspective: "1000px" }}
        {...props}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card
            className="absolute w-full h-full backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            {front}
          </Card>
          <Card
            className="absolute w-full h-full backface-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {back}
          </Card>
        </motion.div>
      </div>
    );
  }
);
FlipCard.displayName = "FlipCard";

// Animated card header with icon animation
interface AnimatedCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
}

const AnimatedCardHeader = React.forwardRef<HTMLDivElement, AnimatedCardHeaderProps>(
  ({ className, icon, children, ...props }, ref) => (
    <CardHeader ref={ref} className={cn("relative", className)} {...props}>
      {icon && (
        <motion.div
          className="mb-2"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
        >
          {icon}
        </motion.div>
      )}
      {children}
    </CardHeader>
  )
);
AnimatedCardHeader.displayName = "AnimatedCardHeader";

export {
  AnimatedCard,
  FadeInCard,
  CardContainer,
  CardItem,
  ExpandableCard,
  FlipCard,
  AnimatedCardHeader,
  // Re-export original components
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

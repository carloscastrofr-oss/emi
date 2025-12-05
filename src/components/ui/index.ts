// ============================================================================
// SHADCN/UI COMPONENTS - Base components
// ============================================================================

// Core UI Components
export * from "./accordion";
export * from "./alert";
export * from "./alert-dialog";
export * from "./avatar";
export * from "./badge";
export * from "./breadcrumb";
export * from "./button";
export * from "./calendar";
export * from "./card";
export * from "./carousel";
export * from "./chart";
export * from "./checkbox";
export * from "./collapsible";
export * from "./command";
export * from "./context-menu";
export * from "./dialog";
export * from "./drawer";
export * from "./dropdown-menu";
export * from "./form";
export * from "./hover-card";
export * from "./input";
export * from "./label";
export * from "./menubar";
export * from "./navigation-menu";
export * from "./pagination";
export * from "./popover";
export * from "./progress";
export * from "./radio-group";
export * from "./resizable";
export * from "./scroll-area";
export * from "./select";
export * from "./separator";
export * from "./sheet";
export * from "./sidebar";
export * from "./skeleton";
export * from "./slider";
export * from "./sonner";
export * from "./spinner";
export * from "./switch";
export * from "./table";
export * from "./tabs";
export * from "./textarea";
export * from "./toast";
export { Toaster as ToasterComponent } from "./toaster";
export * from "./toggle";
export * from "./toggle-group";
export * from "./tooltip";

// ============================================================================
// ANIMATED COMPONENTS - Enhanced with Framer Motion
// ============================================================================

// Motion utilities and base animations
export {
  // Animation variants
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  slideInFromBottom,
  slideInFromLeft,
  slideInFromRight,
  staggerContainer,
  staggerItem,
  popIn,
  shake,
  pulse,
  // Motion components
  MotionDiv,
  MotionContainer,
  MotionItem,
  AnimatedPresenceWrapper,
  PageTransition,
  HoverScale,
  HoverLift,
  // Loading animations
  LoadingDots,
  LoadingSpinner,
  LoadingPulse,
  // Other utilities
  AnimatedCounter,
  AnimatedText,
  RevealOnScroll,
  // Re-exports from framer-motion
  motion,
  AnimatePresence,
} from "./motion";

// Animated Card components
export {
  AnimatedCard,
  FadeInCard,
  CardContainer,
  CardItem,
  ExpandableCard,
  FlipCard,
  AnimatedCardHeader,
} from "./animated-card";

// Animated Dialog components
export {
  Dialog as AnimatedDialog,
  DialogContent as AnimatedDialogContent,
  DialogContentSlideUp,
  DialogContentPop,
  DialogContentFullscreen,
  DialogHeader as AnimatedDialogHeader,
  DialogFooter as AnimatedDialogFooter,
  DialogTitle as AnimatedDialogTitle,
  DialogDescription as AnimatedDialogDescription,
  DialogTrigger as AnimatedDialogTrigger,
  DialogClose as AnimatedDialogClose,
} from "./animated-dialog";

// Animated Tabs components
export { AnimatedTabs, UnderlineTabs, PillTabs, VerticalTabs } from "./animated-tabs";

// Animated Button components
export {
  AnimatedButton,
  RippleButton,
  MagneticButton,
  GlowButton,
  BounceButton,
} from "./animated-button";

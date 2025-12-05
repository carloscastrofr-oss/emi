"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

interface AnimatedTabsTriggerProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> {
  layoutId?: string;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  AnimatedTabsTriggerProps
>(({ className, layoutId: _layoutId, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  </TabsPrimitive.Content>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// ============================================================================
// ANIMATED TABS WITH INDICATOR
// ============================================================================

export { Tabs, TabsList, TabsTrigger, TabsContent };

interface AnimatedTabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultValue?: string;
  className?: string;
  listClassName?: string;
  contentClassName?: string;
}

function AnimatedTabs({
  tabs,
  defaultValue,
  className,
  listClassName,
  contentClassName,
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0]?.id);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={cn("w-full", className)}>
      <TabsList className={cn("relative", listClassName)}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="relative z-10">
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-background rounded-sm shadow-sm"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <AnimatePresence mode="wait">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn("mt-2", contentClassName)}
              >
                {tab.content}
              </motion.div>
            )
        )}
      </AnimatePresence>
    </Tabs>
  );
}

// ============================================================================
// UNDERLINE ANIMATED TABS
// ============================================================================

interface UnderlineTabsProps {
  tabs: { id: string; label: string; content: React.ReactNode; icon?: React.ReactNode }[];
  defaultValue?: string;
  className?: string;
}

function UnderlineTabs({ tabs, defaultValue, className }: UnderlineTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0]?.id);

  return (
    <div className={cn("w-full", className)}>
      <div className="relative border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors",
                "hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-md",
                activeTab === tab.id ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="underlineIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="mt-4"
              >
                {tab.content}
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// PILL ANIMATED TABS
// ============================================================================

interface PillTabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultValue?: string;
  className?: string;
}

function PillTabs({ tabs, defaultValue, className }: PillTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0]?.id);

  return (
    <div className={cn("w-full", className)}>
      <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-1.5 text-sm font-medium transition-colors rounded-full",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              activeTab === tab.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="pillIndicator"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="mt-4"
              >
                {tab.content}
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// VERTICAL TABS
// ============================================================================

interface VerticalTabsProps {
  tabs: { id: string; label: string; content: React.ReactNode; icon?: React.ReactNode }[];
  defaultValue?: string;
  className?: string;
}

function VerticalTabs({ tabs, defaultValue, className }: VerticalTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0]?.id);

  return (
    <div className={cn("flex gap-6", className)}>
      <div className="relative flex flex-col gap-1 min-w-[200px]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-left transition-colors rounded-md",
              "hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeTab === tab.id ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="verticalIndicator"
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-full"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
            {tab.icon && <span className="text-lg">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {tabs.map(
            (tab) =>
              activeTab === tab.id && (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.content}
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export { AnimatedTabs, UnderlineTabs, PillTabs, VerticalTabs };

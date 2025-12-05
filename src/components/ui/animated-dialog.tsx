"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any
  return (
  <DialogPrimitive.Overlay ref={ref} asChild forceMount>
    <motion.div
      className={cn(
          "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 backdrop-blur-sm",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
        {...(motionProps as any)}
    />
  </DialogPrimitive.Overlay>
  )
})
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any
  return (
  <DialogPortal forceMount>
    <AnimatePresence mode="wait">
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} asChild forceMount>
        <motion.div
          className={cn(
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className
          )}
          initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-48%" }}
          animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
          exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-48%" }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
          }}
            {...(motionProps as any)}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-4 w-4" />
            </motion.div>
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </motion.div>
      </DialogPrimitive.Content>
    </AnimatePresence>
  </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogContentSlideUp = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any
  return (
  <DialogPortal forceMount>
    <AnimatePresence mode="wait">
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} asChild forceMount>
        <motion.div
          className={cn(
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className
          )}
          initial={{ opacity: 0, y: 100, x: "-50%" }}
          animate={{ opacity: 1, y: "-50%", x: "-50%" }}
          exit={{ opacity: 0, y: 100, x: "-50%" }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
          }}
            {...(motionProps as any)}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </motion.div>
      </DialogPrimitive.Content>
    </AnimatePresence>
  </DialogPortal>
  )
})
DialogContentSlideUp.displayName = "DialogContentSlideUp"

const DialogContentPop = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any
  return (
  <DialogPortal forceMount>
    <AnimatePresence mode="wait">
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} asChild forceMount>
        <motion.div
          className={cn(
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className
          )}
          initial={{ opacity: 0, scale: 0.5, x: "-50%", y: "-50%" }}
          animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
          exit={{ opacity: 0, scale: 0.5, x: "-50%", y: "-50%" }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 400,
          }}
            {...(motionProps as any)}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </motion.div>
      </DialogPrimitive.Content>
    </AnimatePresence>
  </DialogPortal>
  )
})
DialogContentPop.displayName = "DialogContentPop"

const DialogContentFullscreen = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any
  return (
  <DialogPortal forceMount>
    <AnimatePresence mode="wait">
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} asChild forceMount>
        <motion.div
          className={cn(
            "fixed inset-4 z-50 grid gap-4 border bg-background p-6 shadow-lg rounded-lg md:inset-8 lg:inset-16",
            className
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 200,
          }}
            {...(motionProps as any)}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </motion.div>
      </DialogPrimitive.Content>
    </AnimatePresence>
  </DialogPortal>
  )
})
DialogContentFullscreen.displayName = "DialogContentFullscreen"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any
  return (
  <motion.div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
      {...(motionProps as any)}
  />
)
}
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any
  return (
  <motion.div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 }}
      {...(motionProps as any)}
  />
)
}
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogContentSlideUp,
  DialogContentPop,
  DialogContentFullscreen,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}


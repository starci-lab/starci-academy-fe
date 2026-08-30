import { cn } from "@heroui/react"

/** Keep every drag endpoint inside the usable viewport and above the compact enrolment bar. */
export const starCiAiDragBoundaryClassName = cn("pointer-events-none", "fixed", "left-4", "right-4", "top-4", "bottom-20", "z-50", "lg:bottom-4")
/** Keep the mascot tactile, readable and above routed content while it moves. */
export const starCiAiFabClassName = cn("pointer-events-auto", "absolute", "bottom-0", "right-0", "inline-flex", "touch-none", "select-none", "items-center", "gap-2", "rounded-full", "border", "border-default-200", "bg-content1/95", "p-2", "shadow-lg", "backdrop-blur", "cursor-grab", "active:cursor-grabbing", "lg:px-3", "lg:py-2", "focus-visible:outline-2", "focus-visible:outline-offset-2", "focus-visible:outline-primary")
/** The mascot alone is enough at constrained widths; the accessible button name remains intact. */
export const starCiAiLabelClassName = cn("hidden", "lg:inline-flex")

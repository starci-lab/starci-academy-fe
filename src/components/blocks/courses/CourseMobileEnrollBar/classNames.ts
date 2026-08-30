import { cn } from "@heroui/react"

/** Pin only the compact course decision on narrow viewports. */
export const mobileEnrollBarClassName = cn("sticky", "bottom-0", "z-40", "flex", "min-w-0", "flex-row", "items-center", "justify-between", "gap-3", "border-t", "border-separator", "bg-background", "px-4", "pt-3", "pb-[max(0.75rem,env(safe-area-inset-bottom))]", "lg:hidden")
/** Keep current and superseded prices as one compact fact. */
export const mobileEnrollPriceClassName = cn("flex", "min-w-0", "flex-row", "flex-wrap", "items-center", "gap-2")

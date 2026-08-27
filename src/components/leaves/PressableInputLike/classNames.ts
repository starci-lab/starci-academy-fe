import { cn } from "@heroui/react"

/** Search trigger field appearance. */
export const pressableInputLikeClassName = cn("h-9", "min-h-9", "w-64", "justify-between", "gap-2", "rounded-field", "border-[var(--field-border)]", "bg-field", "px-3", "font-normal", "text-field-foreground", "shadow-[var(--field-shadow)]", "hover:bg-field")
/** Search trigger content layout. */
export const pressableInputLikeContentClassName = cn("inline-flex", "min-w-0", "items-center", "gap-2")
/** Search trigger placeholder. */
export const pressableInputLikePlaceholderClassName = cn("truncate", "text-sm", "text-field-placeholder")

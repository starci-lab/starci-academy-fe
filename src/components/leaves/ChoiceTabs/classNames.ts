import { cn } from "@heroui/react"

/** Resolve the list composition when a long segmented choice reaches extreme zoom. */
export const getChoiceTabsListClassName = (stackAtNarrow: boolean) => cn(stackAtNarrow ? "max-[399px]:flex-col" : undefined)
/** Resolve tab styling by variant. */
export const getChoiceTabClassName = (variant: "primary" | "secondary", stackAtNarrow = false) => variant === "primary"
    ? cn("whitespace-nowrap", "rounded-full", "px-0.5", "min-[360px]:px-2", "sm:px-4", stackAtNarrow ? "max-[399px]:w-full" : undefined, "focus-visible:outline-none", "focus-visible:ring-2", "focus-visible:ring-inset", "focus-visible:ring-accent", "aria-selected:bg-surface", "aria-selected:shadow-surface")
    : cn("whitespace-nowrap", "rounded-small", "border-b-2", "border-transparent", "px-2", "sm:px-3", "focus-visible:outline-none", "focus-visible:ring-2", "focus-visible:ring-inset", "focus-visible:ring-accent", "aria-selected:border-accent")
/** Tab content layout. */
export const choiceTabContentClassName = cn("inline-flex", "items-center", "gap-2")

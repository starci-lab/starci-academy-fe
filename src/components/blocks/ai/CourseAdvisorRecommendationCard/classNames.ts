import { cn } from "@heroui/react"

/** Stable visual roles for one platform-hydrated course recommendation. */
export const recommendationCardClassNames = {
    root: cn("flex", "min-w-0", "flex-col", "gap-3", "overflow-hidden", "rounded-[1.25rem]", "border", "border-separator", "bg-surface", "p-3", "shadow-sm"),
    identity: cn("flex", "min-w-0", "flex-col", "items-start", "gap-2"),
    copy: cn("flex", "min-w-0", "flex-1", "flex-col", "gap-1"),
    reason: cn("line-clamp-2"),
    evidence: cn("flex", "flex-col", "gap-2"),
    gap: cn("rounded-[0.875rem]", "bg-default", "px-3", "py-2"),
    gapCopy: cn("line-clamp-2"),
    platform: cn("flex", "min-w-0", "flex-col", "gap-3", "rounded-[1rem]", "border", "border-separator", "bg-background", "p-3"),
    platformHeading: cn("flex", "min-w-0", "flex-col", "items-start", "gap-2"),
    cta: cn(
        "inline-flex", "min-h-10", "w-full", "items-center", "justify-center", "gap-2", "rounded-full",
        "bg-accent", "px-4", "py-2", "text-sm", "font-semibold", "text-accent-foreground", "no-underline",
        "transition-colors", "hover:bg-accent-hover", "focus-visible:outline-2", "focus-visible:outline-offset-2", "focus-visible:outline-focus",
    ),
} as const

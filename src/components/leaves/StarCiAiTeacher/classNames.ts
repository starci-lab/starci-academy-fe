import { cn } from "@heroui/react"

/** Stable circular-avatar roles for the StarCi AI teacher character. */
export const starCiAiTeacherClassNames = {
    root: cn("relative", "inline-flex", "shrink-0", "overflow-hidden", "rounded-full", "border", "border-accent/20", "bg-accent-soft", "shadow-sm"),
    sm: cn("size-8"),
    md: cn("size-11"),
    hero: cn("size-28", "border-2", "shadow-md"),
    loading: cn("animate-pulse"),
    image: cn("h-full", "w-full", "scale-[1.32]", "object-cover", "object-top", "translate-y-1"),
    status: cn("absolute", "bottom-0.5", "right-0.5", "size-2.5", "rounded-full", "border-2", "border-surface", "bg-success"),
} as const

/** Select the teacher avatar measure while preserving one circular identity. */
export const getStarCiAiTeacherClassName = (size: "sm" | "md" | "hero", isLoading?: boolean) => cn(
    starCiAiTeacherClassNames.root,
    starCiAiTeacherClassNames[size],
    isLoading === true && starCiAiTeacherClassNames.loading,
)

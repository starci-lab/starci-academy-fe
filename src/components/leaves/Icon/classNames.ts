import { cn } from "@heroui/react"

/** Icon role dimensions. */
export const iconRoleClassNames = { heading: cn("size-6", "shrink-0"), leading: cn("size-5", "shrink-0"), chip: cn("size-4", "shrink-0") } as const
/** Loading icon placeholder. */
export const iconLoadingClassName = cn("size-5", "shrink-0", "animate-pulse", "rounded-full", "bg-default")
/** Completion icon color. */
export const iconCompleteClassName = cn("text-success-soft-foreground")
/** Resolve icon role and completion styling. */
export const getIconClassName = (role: keyof typeof iconRoleClassNames, complete: boolean) => cn(iconRoleClassNames[role], complete ? iconCompleteClassName : undefined)

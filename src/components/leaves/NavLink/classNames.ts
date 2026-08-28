/** Colocated class name exports for NavLink. */
import { cn } from "@heroui/react"

/** Base and current styles for each navigation kind. */
export const kindClasses = {
    route: { base: cn("inline-flex", "items-center", "gap-2", "text-sm"), current: cn("inline-flex", "items-center", "gap-2", "text-sm", "font-semibold") },
    tab: { base: cn("inline-flex", "items-center", "gap-2", "border-b-2", "border-transparent", "text-sm"), current: cn("inline-flex", "items-center", "gap-2", "border-b-2", "border-accent", "text-sm") },
    section: { base: cn("inline-flex", "items-center", "gap-2", "text-sm"), current: cn("inline-flex", "items-center", "gap-2", "text-sm", "font-semibold") },
} as const
/** Base and current styles for icon-only route destinations. */
export const iconOnly = { base: cn("inline-flex", "size-11", "shrink-0", "items-center", "justify-center", "rounded-full", "p-0", "text-muted"), current: cn("inline-flex", "size-11", "shrink-0", "items-center", "justify-center", "rounded-full", "bg-accent-soft", "p-0", "text-accent-soft-foreground") } as const
/** Resolve navigation styling by kind and state. */
export const getNavLinkClassName = (kind: keyof typeof kindClasses, current: boolean, iconOnlyRoute: boolean, depth: 1 | 2 | 3) => {
    const selected = iconOnlyRoute ? iconOnly : kindClasses[kind]
    return cn(current ? selected.current : selected.base, depth === 2 ? "pl-3" : depth === 3 ? "pl-6" : undefined)
}

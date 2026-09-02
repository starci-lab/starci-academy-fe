import { cn } from "@heroui/react"

export type ActionAppearance = "inline" | "muted" | "choice" | "route" | "tab" | "section" | "disclosure" | "plain"
export type ActionTextSize = "xs" | "sm" | "md"

const SIZE_CLASS_NAMES = {
    xs: "text-xs leading-4",
    sm: "text-sm leading-5",
    md: "text-base leading-6",
} as const

const APPEARANCE_CLASS_NAMES = {
    inline: "font-medium text-foreground underline-offset-4 hover:underline focus-visible:underline",
    muted: "font-medium text-muted underline-offset-4 hover:underline focus-visible:underline",
    choice: "rounded-full px-2 py-1 font-medium text-foreground data-[current=true]:bg-accent-soft data-[current=true]:text-accent-soft-foreground",
    route: "rounded-full px-3 py-2 text-muted data-[current=true]:bg-accent-soft data-[current=true]:font-semibold data-[current=true]:text-accent-soft-foreground",
    tab: "border-b-2 border-transparent py-3 text-muted data-[current=true]:border-accent data-[current=true]:font-semibold data-[current=true]:text-accent",
    section: "rounded-large px-3 py-2 text-foreground hover:bg-default focus-visible:bg-default data-[current=true]:bg-accent-soft data-[current=true]:font-semibold data-[current=true]:text-accent-soft-foreground",
    disclosure: "font-semibold text-accent-soft-foreground underline-offset-4 hover:underline focus-visible:underline",
    plain: "text-foreground no-underline",
} as const

/** One typography/selection recipe shared by native links and text-styled actions. */
export const getActionClassName = (appearance: ActionAppearance, size: ActionTextSize) => cn(
    "group inline-flex w-fit min-w-0 shrink-0 items-center gap-2 outline-none",
    "disabled:cursor-default disabled:opacity-50",
    SIZE_CLASS_NAMES[size],
    APPEARANCE_CLASS_NAMES[appearance],
)

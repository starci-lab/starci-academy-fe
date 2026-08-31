import { cn } from "@heroui/react"

/** Profile-only end clearance keeps the selected destination label fully visible after compact auto-scroll. */
export const profileTabsClassName = cn(
    "relative",
    "w-full",
    "min-w-0",
    "border-b",
    "border-separator",
    "bg-background",
    "[&_[data-grammar-tabs-overflow=scroll]]:relative",
    "[&_[data-grammar-tabs-overflow=scroll]]:pe-6",
    "[&_[data-grammar-tabs-overflow=scroll]]:scroll-pe-6",
    "[&_[data-grammar-tabs-overflow=scroll]]:after:pointer-events-none",
    "[&_[data-grammar-tabs-overflow=scroll]]:after:absolute",
    "[&_[data-grammar-tabs-overflow=scroll]]:after:inset-y-0",
    "[&_[data-grammar-tabs-overflow=scroll]]:after:right-0",
    "[&_[data-grammar-tabs-overflow=scroll]]:after:w-8",
    "[&_[data-grammar-tabs-overflow=scroll]]:after:content-['']",
    "[&_[data-grammar-tabs-overflow=scroll]]:after:bg-gradient-to-l",
    "[&_[data-grammar-tabs-overflow=scroll]]:after:from-background",
    "[&_[data-grammar-tabs-overflow=scroll]]:after:to-transparent",
)

/** Compact edge cues make the off-screen profile destinations discoverable in either scroll direction. */
export const profileTabsStartCueClassName = cn(
    "pointer-events-none",
    "absolute",
    "inset-y-0",
    "start-0",
    "z-10",
    "flex",
    "w-7",
    "items-center",
    "justify-start",
    "bg-gradient-to-r",
    "from-background",
    "to-transparent",
    "ps-1",
    "text-lg",
    "text-accent",
    "sm:hidden",
)

/** Mirror the start cue so compact users can discover destinations beyond the current window. */
export const profileTabsEndCueClassName = cn(
    profileTabsStartCueClassName,
    "start-auto",
    "end-0",
    "justify-end",
    "bg-gradient-to-l",
    "ps-0",
    "pe-1",
)

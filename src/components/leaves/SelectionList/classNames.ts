import { cn } from "@heroui/react"

/** Selection list item styles. */
export const selectionListItemClassNames = { scopes: cn("group", "min-h-11", "rounded-large", "px-2", "py-2", "text-foreground", "data-[selected=true]:bg-accent-soft", "data-[selected=true]:text-accent-soft-foreground", "data-[selected=true]:data-[hovered=true]:bg-accent-soft"), results: cn("items-start", "py-3"), outline: cn("group", "min-h-11", "rounded-medium", "px-3", "py-2", "text-foreground", "data-[selected=true]:bg-accent-soft", "data-[selected=true]:text-accent-soft-foreground", "data-[selected=true]:data-[hovered=true]:bg-accent-soft"), navigation: cn("group", "min-h-11", "rounded-large", "px-2", "py-2", "text-foreground", "data-[selected=true]:bg-accent-soft", "data-[selected=true]:text-accent-soft-foreground", "data-[selected=true]:data-[hovered=true]:bg-accent-soft"), "navigation-collapsed": cn("group", "flex", "size-11", "min-h-11", "shrink-0", "items-center", "justify-center", "rounded-full", "bg-transparent", "p-0", "text-foreground", "data-[hovered=true]:bg-transparent", "data-[selected=true]:bg-transparent") } as const
/** Collapsed list layout. */
export const selectionListCollapsedClassName = cn("flex", "flex-col", "items-center", "p-0")
/** Outline row content. */
export const selectionListOutlineContentClassName = cn("flex", "min-w-0", "flex-1", "items-start", "gap-3")
/** Outline title. */
export const selectionListLabelClassName = cn("min-w-0", "flex-1", "text-base", "font-normal", "text-foreground")
/** Collapsed icon plate. */
export const selectionListCompactIconClassName = cn("grid", "size-9", "place-items-center", "rounded-full")
/** Result row content. */
export const selectionListResultContentClassName = cn("flex", "min-w-0", "flex-1", "items-center", "gap-2")
/** Result text stack. */
export const selectionListResultTextClassName = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-1")
/** Result title. */
export const selectionListResultLabelClassName = cn("truncate", "text-sm", "font-medium", "text-foreground")
/** Result description. */
export const selectionListDescriptionClassName = cn("truncate", "text-xs", "text-muted")
/** Outline metadata aligned at the trailing edge. */
export const selectionListMetaClassName = cn("shrink-0", "text-xs", "text-muted")
/** Result badge. */
export const selectionListBadgeClassName = cn("shrink-0", "rounded-full", "bg-default", "px-2", "py-1", "text-xs", "text-muted")

/**
 * Product-neutral layout vocabulary owned by Core.
 *
 * Product breakpoints, token names and selectors remain in the consuming application.
 * This list intentionally contains no product component names.
 */
export const CORE_LAYOUT_CLASS_NAMES = [
    "flex",
    "grid",
    "flex-col",
    "flex-row",
    "flex-wrap",
    "flex-nowrap",
    "items-start",
    "items-center",
    "items-end",
    "items-stretch",
    "justify-between",
    "justify-center",
    "justify-end",
    "gap-1",
    "gap-2",
    "gap-3",
    "gap-4",
    "gap-6",
    "gap-8",
    "min-w-0",
    "min-h-0",
    "w-full",
    "[&>*]:w-full",
    "[&>*]:max-w-md",
    "grow",
    "grow-0",
    "flex-1",
    "shrink-0",
    "overflow-hidden",
    "overflow-auto",
    "overflow-y-auto",
    "overscroll-contain",
    "relative",
    "sticky",
    "hidden",
    "contents",
] as const

export type CoreLayoutClassName = (typeof CORE_LAYOUT_CLASS_NAMES)[number]

import { cn } from "@heroui/react"

/** Select surface label copy that recedes when the owner is nested. */
export const getLabelClassName = (depth: "top" | "nested") => cn(
    "starci-core-label",
    "min-w-0",
    "font-semibold",
    depth === "nested" ? "text-xs leading-4" : "text-sm leading-5",
)

/**
 * Rule ids this element can claim for the presentation classes above.
 * `text-xs`/`leading-4` and `text-sm`/`leading-5` match FONT-1 and FONT-2 on the
 * closed type scale (font.md `## Scale`). `font-semibold` (weight) and `min-w-0`
 * (measure) carry no rule id in their topic files and stay unclaimed.
 * `.starci-core-label { margin: 0 }` (common/styles.css) is unconditional across both
 * depths and matches margin.md's "Label | 0 | MARGIN-0" row.
 */
export const getLabelContract = (depth: "top" | "nested") => depth === "nested" ? "FONT-1 MARGIN-0" : "FONT-2 MARGIN-0"

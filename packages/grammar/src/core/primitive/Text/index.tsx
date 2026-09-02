import { cn, skeletonVariants } from "@heroui/react"
import type { ReactNode } from "react"

export type TextAs = "div" | "p" | "span"
export type TextTone = "default" | "muted" | "accent"
export type TextSize = "xs" | "sm" | "md" | "metric-lead"
export type TextWeight = "normal" | "medium" | "semibold"
export type TextLive = "off" | "polite" | "assertive"

export type TextProps = {
    /** Select the semantic line owner without exposing styling hooks. */
    readonly as?: TextAs
    readonly id?: string
    readonly children?: ReactNode
    /** App-owned glyph or other inline meaning placed before the copy. */
    readonly startContent?: ReactNode
    readonly size?: TextSize
    readonly tone?: TextTone
    readonly weight?: TextWeight
    readonly live?: TextLive
    readonly isSkeleton?: boolean
    readonly isSuperseded?: boolean
    /** Opt into the shared selected-parent accent treatment. */
    readonly parentEmphasis?: "accent-soft"
}

const LIVE_ROLES = { off: undefined, polite: "status", assertive: "alert" } as const

const TEXT_CLASS_NAME = cn(
    "text-base", "leading-6", "font-normal", "text-foreground",
    "data-[size=xs]:text-xs", "data-[size=xs]:leading-4", "data-[size=xs]:text-muted",
    "data-[size=sm]:text-sm", "data-[size=sm]:leading-5",
    "data-[size=metric-lead]:text-3xl", "data-[size=metric-lead]:leading-9",
    "data-[tone=muted]:text-muted", "data-[tone=accent]:text-accent-soft-foreground",
    "data-[parent-emphasis=accent-soft]:group-data-[selected=true]:text-accent-soft-foreground",
    "data-[weight=medium]:font-medium", "data-[weight=semibold]:font-semibold",
    "data-[start-content=true]:inline-flex", "data-[start-content=true]:items-center", "data-[start-content=true]:gap-2",
    "data-[superseded=true]:line-through",
)

const FONT_RULE_BY_SIZE: Record<TextSize, string> = {
    xs: "FONT-1",
    sm: "FONT-2",
    md: "FONT-3",
    "metric-lead": "FONT-5",
}

const TONE_RULE_BY_RESOLVED_TONE: Record<TextTone, string> = {
    default: "TONE-1",
    muted: "TONE-2",
    accent: "TONE-3",
}

/**
 * Rule ids this element can claim from its resolved size and tone.
 * `size` selects the exact scale row in font.md `## Scale` (FONT-1/2/3/5); the
 * resolved tone (forced `muted` at `size="xs"`) selects the exact row in
 * tone.md `## Scale` (TONE-1/2/3). `gap-2` fires only while `startContent` is
 * shown, matching the `Text` with `startContent` row in gap.md's
 * "Gaps Common already owns" table (GAP-2). Weight classes (`font-medium`,
 * `font-semibold`) and the `parentEmphasis` accent-soft variant carry no rule
 * id here and stay unclaimed.
 */
const getTextContract = (size: TextSize, resolvedTone: TextTone, showsStartContent: boolean) => {
    const ids = [FONT_RULE_BY_SIZE[size], TONE_RULE_BY_RESOLVED_TONE[resolvedTone]]
    if (showsStartContent) ids.push("GAP-2")
    return ids.join(" ")
}

/**
 * The skeleton keeps the size geometry (FONT-1/2/3/5) but its copy is
 * `text-transparent`, so no tone is actually visible to claim.
 */
const getTextSkeletonContract = (size: TextSize) => FONT_RULE_BY_SIZE[size]

const SKELETON_CLASS_NAMES = {
    xs: skeletonVariants({ animationType: "shimmer" }).base({
        className: "inline-block w-10 select-none rounded text-xs leading-4 text-muted text-transparent",
    }),
    sm: skeletonVariants({ animationType: "shimmer" }).base({
        className: "inline-block w-12 select-none rounded text-sm leading-5 text-transparent",
    }),
    md: skeletonVariants({ animationType: "shimmer" }).base({
        className: "inline-block w-40 max-w-full select-none rounded text-base leading-6 text-transparent",
    }),
    "metric-lead": skeletonVariants({ animationType: "shimmer" }).base({
        className: "inline-block w-40 max-w-full select-none rounded text-3xl leading-9 text-transparent",
    }),
} as const

/** One resolved line of copy with explicit semantics, hierarchy and announcement behavior. */
export const Text = ({
    as: Element = "div",
    id,
    children,
    startContent,
    size = "md",
    tone,
    weight = "normal",
    live = "off",
    isSkeleton = false,
    isSuperseded = false,
    parentEmphasis,
}: TextProps) => {
    const resolvedTone = size === "xs" ? "muted" : tone ?? "default"
    const showsStartContent = startContent != null && !isSkeleton

    return (
        <Element
            id={id}
            data-tier="atom"
            data-component="Text"
            data-size={size}
            data-tone={resolvedTone}
            data-weight={weight}
            data-start-content={showsStartContent ? "true" : "false"}
            data-superseded={isSuperseded ? "true" : "false"}
            data-parent-emphasis={parentEmphasis}
            data-live={live}
            data-loading={isSkeleton ? "true" : "false"}
            data-contract={isSkeleton ? getTextSkeletonContract(size) : getTextContract(size, resolvedTone, showsStartContent)}
            role={isSkeleton ? undefined : LIVE_ROLES[live]}
            aria-live={isSkeleton || live === "off" ? undefined : live}
            aria-hidden={isSkeleton || undefined}
            className={isSkeleton ? SKELETON_CLASS_NAMES[size] : TEXT_CLASS_NAME}
        >
            {showsStartContent ? startContent : null}
            {isSkeleton ? "\u00a0" : children}
        </Element>
    )
}

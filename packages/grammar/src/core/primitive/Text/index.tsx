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

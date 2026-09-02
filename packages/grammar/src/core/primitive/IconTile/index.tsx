import { cn, skeletonVariants } from "@heroui/react"
import type { ReactNode } from "react"
import { Icon, type IconSource } from "../Icon/index.js"

export type IconTileTone = "neutral" | "accent" | "success" | "warning" | "danger"
export type IconTileSize = "sm" | "md"

export type IconTileProps = {
    /** Fallback glyph selected by the app's semantic icon map. */
    readonly source: IconSource
    /** Optional app-owned artwork replaces the fallback glyph without changing plate geometry. */
    readonly artwork?: ReactNode
    readonly ariaLabel?: string
    readonly tone?: IconTileTone
    readonly size?: IconTileSize
    readonly isSkeleton?: boolean
}

const SIZE_CLASS_NAMES = {
    sm: "size-8 rounded-lg",
    md: "size-10 rounded-xl",
} as const

const TONE_CLASS_NAMES = {
    neutral: "bg-default text-muted",
    accent: "bg-accent-soft text-accent-soft-foreground",
    success: "bg-success-soft text-success-soft-foreground",
    warning: "bg-warning-soft text-warning-soft-foreground",
    danger: "bg-danger-soft text-danger-soft-foreground",
} as const

const SKELETON_CLASS_NAME = skeletonVariants({ animationType: "shimmer" }).base()

/** Filled icon plate with one owned size, radius, tone pair, and loading geometry. */
export const IconTile = ({
    source,
    artwork,
    ariaLabel,
    tone = "neutral",
    size = "sm",
    isSkeleton = false,
}: IconTileProps) => {
    const showsArtwork = !isSkeleton && artwork != null
    return (
        <span
            data-tier="atom"
            data-component="IconTile"
            data-tone={tone}
            data-size={size}
            data-artwork={showsArtwork ? "true" : "false"}
            data-loading={isSkeleton ? "true" : "false"}
            aria-hidden={isSkeleton || undefined}
            className={cn(
                "inline-flex shrink-0 items-center justify-center overflow-hidden",
                SIZE_CLASS_NAMES[size],
                isSkeleton ? SKELETON_CLASS_NAME : showsArtwork ? undefined : TONE_CLASS_NAMES[tone],
            )}
        >
            {isSkeleton ? null : showsArtwork ? artwork : (
                <Icon source={source} usage="leading" {...(ariaLabel === undefined ? {} : { ariaLabel })} />
            )}
        </span>
    )
}

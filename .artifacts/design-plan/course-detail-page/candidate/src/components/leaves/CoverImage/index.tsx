import { skeletonVariants } from "@heroui/react"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `CoverImage`: one course's artwork, at a fixed aspect.
 *
 * Target path: `src/components/leaves/CoverImage/index.tsx`.
 *
 * WHY THIS OWNER HAS TO EXIST. The target has no image leaf at any tier — `IconTile` draws a glyph
 * on a tile, not a bitmap — so `CourseEntity.coverImageUrl` currently has nowhere to render. Every
 * card in this direction is unbuildable without it.
 *
 * THE ASPECT IS THE LEAF'S, NOT THE CALLER'S. A caller choosing its own ratio is how a grid of
 * cards ends up with rows of different heights; the two ratios here are the two the product
 * actually uses — a full card cover and the compact thumbnail beside an owned course.
 *
 * A MISSING SOURCE IS A REAL STATE, not an error. `coverImageUrl` is nullable in the schema, so the
 * leaf draws a token surface rather than a broken image box. It never renders an `img` with an
 * empty `src`, which browsers resolve against the current URL and re-request the page for.
 */

/** How much room the artwork takes. */
export type CoverImageRatio = "wide" | "thumb"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type CoverImageData = {
    /** The artwork source. `null` or absent draws the token fallback. */
    readonly src?: string | null
    /**
     * The already-resolved alternative text. Empty string is legitimate and means decorative:
     * the course title is already beside the artwork, so a repeat is noise to a screen reader.
     */
    readonly alt: string
    /** The fixed aspect. */
    readonly ratio?: CoverImageRatio
}

/** Props for {@link CoverImage}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type CoverImageProps = LeafProps<CoverImageData>

/** The two aspects, written as whole class literals so Tailwind can see them. */
const RATIO_CLASSES = {
    wide: "aspect-video w-full",
    thumb: "aspect-video w-24 shrink-0",
} as const

const FRAME_CLASSES = "overflow-hidden rounded-2xl bg-surface-secondary"

/**
 * Draw one course's artwork, or the token surface that stands in for a missing one.
 *
 * @param input - {@link CoverImageProps}
 */
export const CoverImage = ({ props, isLoading = false }: CoverImageProps) => {
    const ratio = props.ratio ?? "wide"
    const frame = `${RATIO_CLASSES[ratio]} ${FRAME_CLASSES}`
    if (isLoading) {
        return (
            <div
                data-tier="leaf"
                data-component="CoverImage"
                data-ratio={ratio}
                data-loading="true"
                className={skeletonVariants({ animationType: "shimmer" }).base({ className: frame })}
            />
        )
    }
    const source = props.src ?? null
    return (
        <div
            data-tier="leaf"
            data-component="CoverImage"
            data-ratio={ratio}
            data-loading="false"
            data-fallback={source === null ? "true" : "false"}
            className={frame}
        >
            {source === null ? null : (
                // A plain `img`, deliberately: the target has not adopted `next/image` anywhere, so
                // introducing it here would be an unproposed runtime decision made by a leaf. There
                // is no `eslint-disable` on this line - the Next plugin is not part of this
                // repository's configuration, and disabling a rule that does not exist is itself an
                // error the gate reports.
                <img src={source} alt={props.alt} className="size-full object-cover" />
            )}
        </div>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const

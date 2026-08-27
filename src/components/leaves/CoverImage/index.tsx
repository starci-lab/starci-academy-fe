import { getCoverImageClassName, coverImageContentClassName } from "./classNames"

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

/** Props for {@link CoverImage}. Three fixed slots, no fourth. */
export type CoverImageProps = { readonly props: CoverImageData; readonly isLoading?: boolean }

/** The two aspects, written as whole class literals so Tailwind can see them. */

/**
 * Draw one course's artwork, or the token surface that stands in for a missing one.
 *
 * @param input - {@link CoverImageProps}
 */
export const CoverImage = (props: CoverImageProps) => {
    const ratio = props.props.ratio ?? "wide"
    const isLoading = props.isLoading === true
    if (isLoading) {
        return (
            <div
                data-ratio={ratio}
                data-loading="true"
                className={getCoverImageClassName(ratio, true)}
            />
        )
    }
    const source = props.props.src ?? null
    return (
        <div
            data-ratio={ratio}
            data-loading="false"
            data-fallback={source === null ? "true" : "false"}
            className={getCoverImageClassName(ratio, false)}
        >
            {source === null ? null : (
                // A plain `img`, deliberately: the target has not adopted `next/image` anywhere, so
                // introducing it here would be an unproposed runtime decision made by a leaf.
                //
                // This line carries no lint suppression, and the wording matters. An earlier comment
                // explained the absence by naming the directive, and the gate flagged the sentence:
                // the rule matches the token in source text, so prose about a suppression reads to
                // it exactly like a suppression. Naming it is what tripped it.
                <img src={source} alt={props.props.alt} className={coverImageContentClassName} />
            )}
        </div>
    )
}

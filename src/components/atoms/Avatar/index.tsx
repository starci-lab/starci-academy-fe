/**
 * ATOM - `Avatar`: the picture that identifies a row or a card faster than its title does.
 *
 * This is one of the atoms the registry's `media` role is drawn with. `card-header` puts it first
 * because the thumbnail is read before the title; `list-row` puts it first for the same reason.
 * The atom never learns which of the two it is in, and that is exactly why it can be used in both.
 *
 * WHY `name` IS REQUIRED AND `src` IS NOT. A person always has a name and does not always have a
 * picture, so the name is the real identity and the image is the decoration on top of it. Making
 * `name` required means there is no code path that produces an avatar with nothing to fall back
 * to and no alternative text - the empty grey circle with no `alt`, which is the bug this shape
 * is built to make impossible.
 *
 * WHY THE ALT TEXT IS NOT A SEPARATE PROP. Two props for one fact is two props to keep in step,
 * and the one that drifts is always the one nobody looks at. The name IS the alternative text.
 *
 * NO `className`. The circle, its size steps and its crop are the avatar. A caller that could
 * square off the corners on one screen would have made a second avatar without naming it.
 */

/** The three sizes the dashboard actually distinguishes between. */
export type AvatarSize = "sm" | "md" | "lg"

/** Props for {@link Avatar}. */
export interface AvatarProps {
    /**
     * The already-resolved display name. It is the identity of the avatar: it seeds the initials
     * when there is no picture, and it IS the alternative text when there is one.
     */
    name: string
    /** The picture, when one exists. Without it the atom falls back to initials rather than to nothing. */
    src?: string
    /** The size step. */
    size?: AvatarSize
    /**
     * Renders the resting shape: same circle, same footprint, no image and no glyphs.
     *
     * MEANS "nothing to show YET" - the first load, no data in hand, which is exactly SWR's
     * `isLoading`. It does NOT mean "a request is in flight": `isValidating` goes true on every
     * focus revalidation, and passing it here would shimmer over a face already on screen.
     */
    isLoading?: boolean
}

/** Diameter and initial size per step. */
const SIZE_CLASSES = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-12 text-base",
} as const

/**
 * The circle and its crop. No ink of its own: initials are read in the page ink that
 * `globals.css` already owns, so this atom has nothing to disagree with it about.
 */
const BASE_CLASSES = "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium uppercase"

/**
 * The fill behind the initials - a translucent tint rather than a fixed grey, so one class is
 * legible on either page surface without the atom being told which one it is on.
 */
const FILL_CLASSES = "bg-slate-500/15"

/** The picture fills the circle and is cropped by it rather than distorted into it. */
const IMAGE_CLASSES = "size-full object-cover"

/**
 * The resting shape - the same circle at the same diameter, so nothing beside it moves. It
 * REPLACES the fill rather than layering over it: two `bg-*` utilities on one node resolve by
 * stylesheet order, not by the order they were typed.
 */
const RESTING_CLASSES = "animate-pulse select-none bg-slate-500/20 text-transparent"

/**
 * The one or two letters shown when there is no picture, read off the name the caller resolved.
 * Two letters at most: a third stops being legible inside the small circle.
 *
 * @param name - The resolved display name.
 */
const initialsOf = (name: string): string =>
    name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word.slice(0, 1))
        .join("")

/**
 * Draw the picture that identifies a row or a card.
 *
 * @param props - {@link AvatarProps}
 */
export const Avatar = ({ name, src, size = "md", isLoading = false }: AvatarProps) => {
    const classes = [BASE_CLASSES, SIZE_CLASSES[size], isLoading ? RESTING_CLASSES : FILL_CLASSES]
        .filter(Boolean)
        .join(" ")
    const showsImage = src !== undefined && src !== "" && !isLoading
    return (
        <span
            data-tier="atom"
            data-component="Avatar"
            data-size={size}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden={isLoading ? true : undefined}
            className={classes}
        >
            {showsImage ? <img src={src} alt={name} className={IMAGE_CLASSES} /> : initialsOf(name)}
        </span>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Avatar" } as const

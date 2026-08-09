import { Avatar as HeroAvatar, skeletonVariants } from "@heroui/react"

/**
 * ATOM - `Avatar`: the picture that identifies a row or a card faster than its title does.
 *
 * This is one of the atoms the registry's `media` role is drawn with. `card-header` puts it first
 * because the thumbnail is read before the title; `list-row` puts it first for the same reason.
 * The atom never learns which of the two it is in, and that is exactly why it can be used in both.
 *
 * WHAT IT DRAWS. HeroUI's `Avatar`, whose `Image` and `Fallback` parts are a single decision
 * rather than two: the fallback is shown until the picture has actually loaded, so a broken URL
 * degrades to initials instead of to a torn image icon. Rebuilding that by hand is how an avatar
 * ends up with a moment of empty circle on every render.
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

/** The size step, as the vendor names it. */
const SIZES = {
    sm: "sm",
    md: "md",
    lg: "lg",
} as const

/** The resting shape - the same circle at the same diameter, so nothing beside it moves. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

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
    const showsImage = src !== undefined && src !== "" && !isLoading
    return (
        <HeroAvatar
            data-tier="atom"
            data-component="Avatar"
            data-size={size}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden={isLoading ? true : undefined}
            size={SIZES[size]}
            color="accent"
            className={isLoading ? RESTING_CLASSES : undefined}
        >
            {showsImage ? <HeroAvatar.Image src={src} alt={name} /> : null}
            <HeroAvatar.Fallback>{isLoading ? "" : initialsOf(name)}</HeroAvatar.Fallback>
        </HeroAvatar>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Avatar" } as const

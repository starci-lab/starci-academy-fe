import { Avatar as HeroAvatar, skeletonVariants } from "@heroui/react"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `Avatar`: the mark that says which person a row is about.
 *
 * INITIALS ARE DERIVED HERE, not passed in. A caller computing them would compute them slightly
 * differently on the next screen, and a person would have two marks.
 */

/** The three steps: beside a line, leading a row, or heading a profile. */
export type AvatarSize = "sm" | "md" | "lg"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type AvatarData = {
    /** The person's already-resolved name. Absent while loading. */
    readonly name?: string
    /** Their picture, when there is one. */
    readonly src?: string
    /** The step. */
    readonly size?: AvatarSize
}

/** Props for {@link Avatar}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type AvatarProps = LeafProps<AvatarData>

/** The size step, as the vendor names it. */
const SIZES = { sm: "sm", md: "md", lg: "lg" } as const

/** The resting shape - same circle, glyphs out. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

/**
 * The first letter of at most the first two words - enough to tell two people apart, short enough
 * to fit the smallest step.
 *
 * @param name - The person's resolved name.
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
 * Draw a person's mark.
 *
 * @param input - {@link AvatarProps}
 */
export const Avatar = ({ props, isLoading = false }: AvatarProps) => {
    const size = props.size ?? "md"
    const name = props.name ?? ""
    const showsImage = props.src !== undefined && props.src !== "" && !isLoading
    return (
        <HeroAvatar
            data-tier="leaf"
            data-component="Avatar"
            data-size={size}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden={isLoading ? true : undefined}
            size={SIZES[size]}
            color="accent"
            className={isLoading ? RESTING_CLASSES : undefined}
        >
            {showsImage ? <HeroAvatar.Image src={props.src} alt={name} /> : null}
            <HeroAvatar.Fallback>{isLoading ? "" : initialsOf(name)}</HeroAvatar.Fallback>
        </HeroAvatar>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const

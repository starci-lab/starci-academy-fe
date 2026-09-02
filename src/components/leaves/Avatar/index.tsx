import { Avatar as DiceAvatar, Style } from "@dicebear/core"
import lorelei from "@dicebear/styles/lorelei.json" with { type: "json" }
import { Avatar as HeroAvatar } from "@heroui/react"
import { avatarFallbackClassName, getAvatarClassName } from "./classNames"

/**
 * LEAF - `Avatar`: the mark that says which person a row is about.
 *
 * FALLBACK IDENTITY IS DERIVED HERE, not passed in. DiceBear receives the resolved name as a
 * stable seed, so one person keeps one mark on every screen without a runtime HTTP request.
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

/** Props for {@link Avatar}. Three fixed slots, no fourth. */
export type AvatarProps = { readonly props: AvatarData; readonly isLoading?: boolean }

/** The size step, as the vendor names it. */
const SIZES = { sm: "sm", md: "md", lg: "lg" } as const

/** The resting shape - same circle, glyphs out. */
/** One local style definition serves every generated fallback. */
const FALLBACK_STYLE = new Style(lorelei)

/** The anonymous seed is deterministic too; rendering must never invent identity with random. */
const ANONYMOUS_SEED = "StarCi"

/**
 * Build the local SVG data URI used when a profile picture is absent or cannot load.
 *
 * @param name - The person's resolved name.
 */
const fallbackAvatarOf = (name: string): string =>
    new DiceAvatar(FALLBACK_STYLE, { seed: name.trim() || ANONYMOUS_SEED }).toDataUri()

/**
 * Draw a person's mark.
 *
 * @param input - {@link AvatarProps}
 */
export const Avatar = (props: AvatarProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    const size = data.size ?? "md"
    const name = data.name ?? ""
    const showsImage = data.src !== undefined && data.src !== "" && !isLoading
    const fallbackSrc = isLoading ? undefined : fallbackAvatarOf(name)
    return (
        <HeroAvatar
            aria-hidden={isLoading ? true : undefined}
            size={SIZES[size]}
            color="accent"
            className={getAvatarClassName(size, isLoading)}
        >
            {!isLoading ? <HeroAvatar.Image src={showsImage ? data.src : fallbackSrc} alt={name} /> : null}
            <HeroAvatar.Fallback>
                {fallbackSrc !== undefined ? (
                    <img
                        className={avatarFallbackClassName}
                        src={fallbackSrc}
                        alt={name}
                    />
                ) : null}
            </HeroAvatar.Fallback>
        </HeroAvatar>
    )
}

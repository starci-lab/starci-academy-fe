import { Link as HeroLink } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `Link`: text that takes the reader somewhere else.
 *
 * IT IS A LINK AND NOT A BUTTON WEARING ONE. A destination belongs in an `<a href>` so it can be
 * opened in a new tab, copied, and read out as a link - a control that navigates on press takes
 * all three away and gives nothing back.
 */

/** How loudly the link is set. `brand` is the mark that names the product. */
export type LinkEmphasis = "default" | "muted" | "brand"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type LinkData = {
    /** Where it goes. */
    readonly href: string
    /** The already-resolved words. Copy, so it never rests. */
    readonly label: string
    /** The meaning drawn before the words. It inherits the link's colour, never its own. */
    readonly icon?: IconName
    /** How loudly it is set. */
    readonly emphasis?: LinkEmphasis
}

/** Props for {@link Link}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type LinkProps = LeafProps<LinkData>

/** The set per emphasis. */
const EMPHASIS_CLASSES = {
    default: "inline-flex items-center gap-2 text-sm",
    muted: "inline-flex items-center gap-2 text-sm text-muted",
    brand: "inline-flex items-center gap-2 text-base font-semibold",
} as const

/**
 * Draw a link.
 *
 * @param input - {@link LinkProps}
 */
export const Link = ({ props }: LinkProps) => (
    <HeroLink
        data-tier="leaf"
        data-component="Link"
        data-emphasis={props.emphasis ?? "default"}
        href={props.href}
        className={EMPHASIS_CLASSES[props.emphasis ?? "default"]}
    >
        {props.icon === undefined ? null : <Icon props={{ name: props.icon, size: "sm" }} />}
        {props.label}
    </HeroLink>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const

import { Link as HeroLink, buttonVariants } from "@heroui/react"
import type { ReactNode } from "react"
import { Icon, type IconName } from "@/components/atoms/Icon"

/**
 * ATOM - `Link`: a way to another surface.
 *
 * A link is not a quiet button, and the difference is the thing this atom exists to keep: a
 * press target that CHANGES THE ADDRESS must be an `<a href>`, or a reader cannot open it in a
 * new tab, copy it, or see where it goes before pressing it. A `Button` with an `onClick` that
 * navigates takes all three away and looks identical.
 *
 * WHAT IT DRAWS. HeroUI's `Link`, so the colour, the hover and the focus ring come from the same
 * tokens as every other interactive thing in the product.
 *
 * `emphasis` IS THE WHOLE VOCABULARY. `default` is an ordinary link inside prose or a nav;
 * `brand` is the wordmark that returns a reader home, at the weight a wordmark needs; `primary`
 * is the one honest main action of a surface that happens to be a NAVIGATION - a signed-out
 * dashboard's way in, which must look like the main action because it is, and must still be an
 * address because that is what it does.
 *
 * `primary` wears the vendor's own button styles rather than a fill assembled here. That is the
 * difference between reusing a primitive and imitating one: the accent, its foreground, the
 * hover and the focus ring all arrive already paired, and they change with the theme rather than
 * with this file.
 */

/** How much of a claim the link makes on the eye. */
export type LinkEmphasis = "default" | "brand" | "primary"

/** Props for {@link Link}. */
export interface LinkProps {
    /** The already-resolved label. */
    children: ReactNode
    /** Where it goes. Required - a link with no address is a button wearing the wrong clothes. */
    href: string
    /** The meaning drawn before the label. It inherits the link's colour, never its own. */
    icon?: IconName
    /** How much of a claim this link makes on the eye. */
    emphasis?: LinkEmphasis
}

/** Keeps the glyph on the label's baseline. The gap belongs to the link, not to the row above. */
const BASE_CLASSES = "inline-flex items-center gap-2"

/**
 * The three claims. The wordmark reads as the name of the product, so it takes the page's own
 * ink and weight; the primary takes the vendor's solid button, because a main action is a fill
 * rather than a tint and the tint belongs to the states that are not the main action.
 */
const EMPHASIS_CLASSES = {
    default: BASE_CLASSES,
    brand: BASE_CLASSES.concat(" text-base font-semibold text-foreground"),
    primary: buttonVariants({ variant: "primary", size: "md" }),
} as const

/**
 * Draw a way to another surface.
 *
 * @param props - {@link LinkProps}
 */
export const Link = ({ children, href, icon, emphasis = "default" }: LinkProps) => (
    <HeroLink
        data-tier="atom"
        data-component="Link"
        data-emphasis={emphasis}
        href={href}
        className={EMPHASIS_CLASSES[emphasis]}
    >
        {icon === undefined ? null : <Icon name={icon} size="md" />}
        {children}
    </HeroLink>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Link" } as const

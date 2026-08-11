import { Link as HeroLink } from "@heroui/react"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `TextLink`: words that change what is on screen without going anywhere.
 *
 * IT IS A BUTTON, NOT A LINK, and that is the whole reason it is a separate leaf from `Link`.
 * "Sign up instead" does not navigate - it swaps the panel under the reader - so an `<a href>`
 * would lie to a screen reader, offer a middle-click that opens nothing, and put a URL in the
 * status bar that leads somewhere it will not go.
 *
 * IT LOOKS LIKE A LINK because to the reader it is the same gesture, and it is the smallest
 * possible target for a decision that is not the surface's main action.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type TextLinkData = {
    /** The already-resolved words. */
    readonly label: string
}

/** What pressing it does. */
export type TextLinkActions = {
    /** Called on press. */
    readonly press?: () => void
}

/** Props for {@link TextLink}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type TextLinkProps = LeafProps<TextLinkData, TextLinkActions>

/**
 * Draw a word that acts.
 *
 * @param input - {@link TextLinkProps}
 */
export const TextLink = ({ props, on }: TextLinkProps) => (
    <HeroLink
        data-tier="leaf"
        data-component="TextLink"
        onPress={on?.press}
    >
        {props.label}
    </HeroLink>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const

import { Link as HeroLink } from "@heroui/react"
import { Icon } from "@/components/leaves/Icon"
import { seeMoreCaretClassName, seeMoreLinkClassName, seeMoreLoadingClassName } from "./classNames"

/**
 * LEAF - `SeeMoreLink`: the way out of a section, drawn at the end of its label line.
 *
 * One link control - words and its intrinsic caret - because the caret is not decoration a caller may drop. It is
 * the only thing distinguishing this from the fact that would otherwise sit in the same place, and
 * a section header where a control and a count look alike is one a reader clicks by mistake.
 *
 * THE CARET MOVES, THE WORDS DO NOT. The slide answers "is this a link" before the pointer has
 * travelled anywhere, and it rides the caret rather than the label because a header whose words
 * shift on hover makes the row underneath jump.
 *
 * IT IS NOT A HEADING'S EQUAL. Semibold at the section label's own size, in the accent's soft
 * foreground rather than the accent itself: loud enough to be found on purpose, quiet enough that
 * it never wins the line it shares with the name of the section.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type SeeMoreLinkData = {
    /** The already-resolved words. Absent while loading. */
    readonly label?: string
}

/** What following it does. Connected code owns any resulting route. */
export type SeeMoreLinkActions = {
    /** Called when the reader follows it. */
    readonly press?: () => void
}

/** Props for {@link SeeMoreLink}. Three fixed slots, no fourth. */
export type SeeMoreLinkProps = { readonly props: SeeMoreLinkData; readonly on?: SeeMoreLinkActions; readonly isLoading?: boolean }

/** The line: never wraps, never grows, and carries the hover group the caret rides. */

/** The hover movement belongs to the cluster; the glyph keeps the icon vocabulary's small step. */

/** The resting shape - the same line box with the glyphs out. */

/**
 * Draw the way out.
 *
 * @param input - {@link SeeMoreLinkProps}
 */
export const SeeMoreLink = (props: SeeMoreLinkProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    if (isLoading) {
        return (
            <span
                data-loading="true"
                aria-hidden
                className={seeMoreLoadingClassName}
            >
                &nbsp;
            </span>
        )
    }

    const inside = (
        <>
            {data.label ?? ""}
            <span className={seeMoreCaretClassName}><Icon props={{ name: "next" }} /></span>
        </>
    )

    return (
        <HeroLink onPress={on?.press} className={seeMoreLinkClassName}>
            {inside}
        </HeroLink>
    )
}

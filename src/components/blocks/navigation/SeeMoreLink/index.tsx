import { Link } from "@/components/atoms/Link"

/**
 * BLOCK - `SeeMoreLink`: the way from a summary to the whole of it.
 *
 * PORTED FROM THE LIVE PRODUCT, where it took four props to answer one question. `onPress`
 * fired when there was no `href`; `href` beat `onPress`; and `decorative` turned the whole
 * thing into inert markup for callers who had made the surrounding card the press target. The
 * chain existed because the component could be three different things.
 *
 * IT IS ONE THING HERE: AN ADDRESS. Going to the fuller view IS a change of address, and an
 * address is the only form of it a reader can open in a new tab, copy, or read before pressing.
 * A handler could do none of those, and `decorative` was the shape that had already given the
 * press away to something else - which is a decision the SURFACE makes by not rendering this
 * at all, rather than one this component makes by rendering itself hollow.
 *
 * WHY THE GLYPH IS NOT A PROP. The arrow is what makes the words read as a way ONWARD rather
 * than as a label, so it belongs to the component in the same way the underline does.
 */

/** Props for {@link SeeMoreLink}. */
export interface SeeMoreLinkProps {
    /** The already-resolved words - "See all", "View the full list". Copy is data. */
    label: string
    /** Where the fuller view lives. */
    href: string
}

/**
 * Draw the way to the fuller view.
 *
 * @param props - {@link SeeMoreLinkProps}
 */
export const SeeMoreLink = ({ label, href }: SeeMoreLinkProps) => (
    <Link href={href} icon="next">
        {label}
    </Link>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "SeeMoreLink" } as const

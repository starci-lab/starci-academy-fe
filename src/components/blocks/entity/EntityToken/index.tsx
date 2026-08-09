import { Link } from "@/components/atoms/Link"
import { Text } from "@/components/atoms/Text"

/**
 * BLOCK - `EntityToken`: a reference to a thing, inside a sentence.
 *
 * PORTED FROM THE LIVE PRODUCT, where it rendered three different elements - a `<button>` for
 * a full-width rail row, a bold `<span>` when nothing was routable, and a link otherwise - and
 * pressing the first two ran a resolve round-trip through a hook before navigating, because the
 * feed knew the entity's opaque id and not its address.
 *
 * THE ROUND-TRIP DOES NOT BELONG IN A BLOCK, AND IT IS NOT HERE. Resolving an id to an address
 * is transport: it is a request, it can fail, and a component that owns it cannot be rendered
 * from a test without a network. The address arrives resolved, which is the same rule every
 * other block in this tree follows about its own data.
 *
 * WHAT REMAINS IS THE ONE JUDGEMENT THE ORIGINAL WAS ACTUALLY MAKING, and it is worth keeping:
 * a reference that CAN be followed is a link, and one that cannot is text. The original's third
 * shape - a whole row rendered as a button that navigated - is a control a reader cannot open
 * in a new tab or read the destination of, so it does not come across; a row that leads
 * somewhere is a row with a link in it.
 */

/** Props for {@link EntityToken}. */
export interface EntityTokenProps {
    /** The already-resolved name of the thing - a username, a lesson title. */
    label: string
    /**
     * Where the thing lives, already resolved. Omitted, the reference is a name rather than a
     * way on: an unroutable token rendered as a link is a dead end a reader has to discover by
     * pressing it.
     */
    href?: string
}

/**
 * Draw a reference to a thing.
 *
 * @param props - {@link EntityTokenProps}
 */
export const EntityToken = ({ label, href }: EntityTokenProps) => {
    if (href === undefined) {
        return (
            <Text size="sm" weight="medium">
                {label}
            </Text>
        )
    }
    return (
        <Link href={href}>
            {label}
        </Link>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "EntityToken" } as const

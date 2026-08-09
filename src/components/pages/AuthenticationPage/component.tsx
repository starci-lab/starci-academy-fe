import { Heading } from "@/components/atoms/Heading"
import { Tree } from "@/components/frames/Tree"
import type { TreeSlot, TreeSlotProps } from "@/components/classNames"

/**
 * PAGE - `AuthenticationPage`, presentational half.
 *
 * The route a reader reaches when there is no application shell to summon an overlay from -
 * a bookmark, a redirect from a guarded page, a browser with the previous tab long closed.
 * It draws the same flow the overlay does, without the dialog, because a page that is already
 * the whole screen has nothing to float above.
 *
 * ONE KEY. `section` is the whole layout decision: the seam under the title is what tells a
 * reader the form below belongs to this heading rather than to the page furniture above it.
 * There is no card here on purpose - a bounded surface inside a screen that is already
 * bounded is a border drawn twice.
 *
 * THE FLOW ARRIVES AS A SLOT. This half fetches nothing and knows nothing about sessions, so
 * the connected thing it renders is handed in rather than imported: the page can then be
 * drawn in a test with a stand-in and still be the page.
 */

/** Every string this page renders, already resolved by the connected half. */
export interface AuthenticationPageLabels {
    /** The page title. */
    title: string
}

/** What hangs on the page. Typed, so the page owns the placement rather than a body. */
export interface AuthenticationPageSlots {
    /** The sign-in flow, passed uncalled so the page can rest it with the surface. */
    body: TreeSlot
}

/** Props for {@link _AuthenticationPage} - presentational; no fetch, no store, no i18n. */
export interface AuthenticationPageProps {
    /** Resolved copy. */
    labels: AuthenticationPageLabels
    /** What hangs on the page. */
    slots: AuthenticationPageSlots
    /** Renders the page in its resting state. */
    isSkeleton?: boolean
}

/**
 * Render the authentication page. See the file header for why one key covers it.
 *
 * @param props - {@link AuthenticationPageProps}
 */
export const _AuthenticationPage = ({ labels, slots, isSkeleton = false }: AuthenticationPageProps) => {
    /** The `heading` role of the `section` key. */
    const Title = ({ isSkeleton: resting }: TreeSlotProps) => (
        <Heading level={1} isSkeleton={resting}>{labels.title}</Heading>
    )

    /** The `body` role of the `section` key: the flow the caller handed in. */
    const Body = slots.body

    return <Tree name="section" isSkeleton={isSkeleton} slots={{ heading: Title, body: Body }} />
}

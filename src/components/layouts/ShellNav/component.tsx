import { Button } from "@/components/atoms/Button"
import { Link } from "@/components/atoms/Link"
import { Tree } from "@/components/frames/Tree"
import type { ContractSlot, ContractSlotProps } from "@/components/contracts"

/**
 * LAYOUT - `ShellNav`, presentational half.
 *
 * The bar every route is read under: the wordmark that returns a reader to the dashboard, and
 * the one control that opens the sign-in overlay.
 *
 * WHY THE OVERLAY HANGS HERE. The overlay is summoned from the shell, so the shell is where it
 * has to be mounted - until this file existed, `SignInOverlay` was mounted NOWHERE and the only
 * way to sign in was to type the `/authentication` address by hand. The dialog is a sibling of
 * the two controls rather than a wrapper around them: a closed `<dialog>` is `display: none`, so
 * it is not a flex item and the bar lays out as if it were not there at all.
 *
 * WHY THE BRAND IS A LINK AND THE SIGN-IN IS A BUTTON. One changes the address and the other
 * opens a surface on the page. That difference decides whether a reader can middle-click it,
 * copy it, or see where it goes - which is why they are two different atoms rather than one
 * styled two ways.
 *
 * ONE KEY. `shell-nav` owns the landmark, the seam and the fact that the wordmark and the action
 * sit at opposite ends of the bar. This file names the key and nothing else.
 */

/** Every string this bar renders, already resolved by the connected half. */
export interface ShellNavLabels {
    /** The wordmark. */
    brand: string
    /** The label of the control that opens the sign-in overlay. */
    signIn: string
}

/** What hangs off the bar. Typed, so the bar owns the placement rather than a body. */
export interface ShellNavSlots {
    /** The sign-in overlay, passed uncalled so the bar can rest it with the surface. */
    overlay: ContractSlot
}

/** Props for {@link _ShellNav} - presentational; no fetch, no store, no i18n. */
export interface ShellNavProps {
    /** Resolved copy. */
    labels: ShellNavLabels
    /** What hangs off the bar. */
    slots: ShellNavSlots
    /** Called when the reader asks to sign in. */
    onOpenSignIn: () => void
    /** Renders the bar in its resting state. */
    isLoading?: boolean
}

/** Where the wordmark leads. The dashboard is the only surface a reader can be returned to. */
const HOME_HREF = "/dashboard"

/**
 * Render the shell bar. See the file header for why the overlay is mounted here.
 *
 * @param props - {@link ShellNavProps}
 */
export const _ShellNav = ({ labels, slots, onOpenSignIn, isLoading = false }: ShellNavProps) => {
    const Overlay = slots.overlay

    /**
     * The `action` role of the `shell-nav` key.
     *
     * Three children for one role, and they are one thing: the bar IS the row, so the wordmark
     * and the control are its direct children rather than a nested node repeating the same
     * flex - and the dialog beside them draws nothing until it is open.
     */
    const Actions = ({ isLoading: resting }: ContractSlotProps) => (
        <>
            <Link href={HOME_HREF} icon="brand" emphasis="brand">
                {labels.brand}
            </Link>
            <Button variant="primary" size="sm" icon="signIn" isLoading={resting} onClick={onOpenSignIn}>
                {labels.signIn}
            </Button>
            <Overlay />
        </>
    )

    return <Tree contract="shell-nav" isLoading={isLoading} slots={{ action: Actions }} />
}

import type { ReactNode } from "react"
import { ModalBranch } from "@/components/branches/ModalBranch"

/**
 * OVERLAY - `SignInOverlay`, presentational half.
 *
 * IT OWNS A SURFACE THAT COVERS THE PAGE, and nothing else - canon OVERLAY-1. The entity inside it
 * belongs to a block (OVERLAY-9), so this file takes no title, no copy and no domain prop: it has
 * never heard of authentication, and the same arrangement carries a confirmation tomorrow.
 *
 * THE PANEL KEEPS ITS OWN TITLE, deliberately. The same panel is a whole route elsewhere, where
 * nothing hosts it - so a title supplied by the host would exist on one surface and be missing on
 * the other, and the panel would have to know which it was inside. The shell supplies the one
 * thing only a covering surface can: the way out.
 *
 * IT DOES NOT TOUCH THE VENDOR. The focus trap, the backdrop, the placement and the scroll lock
 * are `ModalBranch`'s, wrapped once - which is what stops two surfaces disagreeing
 * about how a modal behaves.
 */

/** Props for the internal presentational overlay view. */
export type SignInOverlayViewProps = {
    /** Whether the surface is on screen. Owned by whoever mounts it, never by the surface. */
    readonly isOpen: boolean
    /** Content mounted inside the modal mechanics branch. */
    readonly children: ReactNode
    /** Every way out: the close control, Escape, the backdrop, and a successful sign-in. */
    readonly onDismiss: () => void
}

/**
 * Draw the covering surface.
 *
 * @param props - {@link SignInOverlayViewProps}
 */
export const SignInOverlayView = (props: SignInOverlayViewProps) => (
    <ModalBranch
        isOpen={props.isOpen}
        size="xs"
        onDismiss={props.onDismiss}
    >
        {props.children}
    </ModalBranch>
)

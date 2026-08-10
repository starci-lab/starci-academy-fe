import type { ReactNode } from "react"
import { ModalShell } from "@/components/leaves/ModalShell"

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
 * are `ModalShell`'s, wrapped once at the leaf tier - which is what stops two surfaces disagreeing
 * about how a modal behaves.
 */

/** Props for {@link _SignInOverlay}. */
export type SignInOverlayProps = {
    /** Whether the surface is on screen. Owned by whoever mounts it, never by the surface. */
    readonly isOpen: boolean
    /** What the surface covers the page in order to show. */
    readonly children?: ReactNode
    /** Every way out: the close control, Escape, the backdrop, and a successful sign-in. */
    readonly onDismiss: () => void
}

/**
 * Draw the covering surface.
 *
 * @param input - {@link SignInOverlayProps}
 */
export const _SignInOverlay = (input: SignInOverlayProps) => (
    <ModalShell isOpen={input.isOpen} size="sm" onDismiss={input.onDismiss}>
        {input.children}
    </ModalShell>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", world: "pure", domain: "auth" } as const

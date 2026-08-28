import type { ReactNode } from "react"
import { ModalBranch } from "@/components/branches/ModalBranch"

/**
 * OVERLAY - `CoursePriceOverlay`, presentational half.
 *
 * IT OWNS A SURFACE THAT COVERS THE PAGE, and nothing else. The reckoning inside it belongs to a
 * block, so this file takes no price, no currency and no copy: it has never heard of a course, and
 * the same arrangement would carry a refund summary tomorrow.
 *
 * IT MOUNTS NO SURFACE BRANCH - canon VENDOR-8. The covering surface is already the bounded object;
 * a `SurfaceCard` inside it would draw a second border and a second inset around a body that is
 * already framed.
 *
 * IT DOES NOT TOUCH THE VENDOR. The focus trap, the backdrop, the placement and the scroll lock are
 * `ModalBranch`'s, which is what stops two overlays disagreeing about how a modal behaves.
 *
 * `sm` RATHER THAN `xs`, because the body is a reckoning read line by line - a label and an amount
 * per row - and at `xs` the amounts wrap under their labels, which is the moment the column stops
 * being a column.
 */

/** Content accepted by the internal presentational view. */
export type CoursePriceOverlayViewProps = {
    /** Whether the surface is on screen. Owned by whoever mounts it, never by the surface. */
    readonly isOpen: boolean
    /** Content mounted inside the modal mechanics branch. */
    readonly children: ReactNode
    /** Every way out: the close control, Escape and the backdrop. */
    readonly onDismiss: () => void
}

/**
 * Draw the covering surface.
 *
 * @param props - {@link CoursePriceOverlayViewProps}
 */
export const CoursePriceOverlayView = (props: CoursePriceOverlayViewProps) => (
    <ModalBranch
        isOpen={props.isOpen}
        size="sm"
        onDismiss={props.onDismiss}
    >
        {props.children}
    </ModalBranch>
)

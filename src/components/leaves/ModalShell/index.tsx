import type { ReactNode } from "react"
import { Modal } from "@heroui/react"

/**
 * LEAF - `ModalShell`: the vendor's covering surface, wrapped once.
 *
 * THE VENDOR IS IMPORTED HERE AND NOWHERE ELSE. A surface that reached for `@heroui/react`
 * directly would be re-deciding a placement, a backdrop and a focus trap this file already fixed,
 * and the two would drift one screen at a time. That is the whole reason the boundary exists, and
 * the lint rule that holds it names this tier by its folder.
 *
 * IT TAKES `children`, which no other leaf does. A covering surface with nothing inside it is not
 * a surface, so this is the `mechanics` carve-out: a vendor compound with its own state plumbing,
 * bounded by the closed list of shells rather than by a rule anybody could opt into.
 *
 * WHY NOT A `<dialog>` WRITTEN BY HAND. Canon OVERLAY-8 asks a covering surface to trap focus and
 * dim what is behind. A hand-rolled one owes both, plus the inertness of the page behind it, the
 * scroll lock, the placement, the escape handling and the backdrop - each then maintained against
 * a browser that keeps changing them. The first version of this surface WAS a native `<dialog>`,
 * and it shipped pinned to the top-left corner because the CSS reset had zeroed the `margin: auto`
 * the platform centres with.
 *
 * IT CARRIES NO TITLE AND NO COPY. What a surface says belongs to whatever is mounted inside it -
 * canon OVERLAY-9 - and the same shell should carry a sign-in panel today and a confirmation
 * tomorrow without learning a word about either.
 */

/** How wide the surface is allowed to get. */
export type ModalShellSize = "sm" | "md" | "lg"

/** Props for {@link ModalShell}. */
export type ModalShellProps = {
    /** Whether the surface is on screen. Owned by whoever mounts it, never by the surface. */
    readonly isOpen: boolean
    /** How wide it may get. */
    readonly size?: ModalShellSize
    /** What the surface covers the page in order to show. */
    readonly children?: ReactNode
    /** Every way out: the close control, Escape, and the backdrop. */
    readonly onDismiss: () => void
}

/**
 * Draw a covering surface.
 *
 * @param input - {@link ModalShellProps}
 */
export const ModalShell = (input: ModalShellProps) => (
    <Modal
        isOpen={input.isOpen}
        onOpenChange={(open: boolean) => {
            if (!open) input.onDismiss()
        }}
    >
        <Modal.Backdrop>
            <Modal.Container size={input.size ?? "md"} placement="center">
                <Modal.Dialog data-tier="leaf" data-component="ModalShell">
                    <Modal.CloseTrigger />
                    <Modal.Body>{input.children}</Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    </Modal>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", mechanics: true, world: "pure" } as const

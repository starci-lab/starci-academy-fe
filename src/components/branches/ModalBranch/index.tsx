import type { ReactNode } from "react"
import { Modal } from "@heroui/react"
import { modalBodyClassName, modalControlledTriggerClassName, modalCoverClassName } from "./classNames"

/**
 * BRANCH - `ModalBranch`: the vendor's covering mechanics around typed children.
 *
 * A modal owns focus trapping, Escape, backdrop dismissal, scroll locking and placement. Its body
 * accepts ordinary React children while leaving focus and dismissal mechanics to the vendor.
 */

/** How wide the surface is allowed to get. */
export type ModalBranchSize = "xs" | "sm" | "md" | "lg" | "cover"

/** Props for {@link ModalBranch}. */
export type ModalBranchProps = {
    /** Whether the surface is on screen. Owned by whoever mounts it, never by the branch. */
    readonly isOpen: boolean
    /** How wide it may get. */
    readonly size?: ModalBranchSize
    /** Every way out: the close control, Escape, and the backdrop. */
    readonly onDismiss: () => void
    readonly children: ReactNode
}

/** Draw the vendor modal mechanics around ordinary React children. */
export const ModalBranch = (props: ModalBranchProps) => (
    <Modal
        isOpen={props.isOpen}
        onOpenChange={(open: boolean) => {
            if (!open) props.onDismiss()
        }}
    >
        {/*
          * HeroUI's controlled Modal root is still implemented with React-Aria DialogTrigger.
          * Supplying its trigger slot consumes that root's PressResponder even though the visible
          * opener is owned by the calling block. Hidden and removed from the accessibility tree,
          * this adapter has no second interaction path; it only completes the vendor anatomy.
          */}
        <Modal.Trigger className={modalControlledTriggerClassName} aria-hidden tabIndex={-1} />
        <Modal.Backdrop>
            <Modal.Container size={props.size ?? "md"} placement="center">
                <Modal.Dialog
                    className={props.size === "cover" ? modalCoverClassName : undefined}
                >
                    <Modal.CloseTrigger />
                    <Modal.Body className={modalBodyClassName}>
                        {props.children}
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    </Modal>
)

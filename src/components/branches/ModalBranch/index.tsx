import { Modal } from "@heroui/react"
import { Tree } from "@/components/branches/Tree"
import type { ContractKey } from "@/components/contracts"
import type { ContractBranchProps } from "@/components/contracts/props"

/**
 * BRANCH - `ModalBranch`: the vendor's covering mechanics around one typed contract.
 *
 * A modal owns focus trapping, Escape, backdrop dismissal, scroll locking and placement. Its body
 * is not an anonymous markup hole: one contract key fixes the content node and one typed render
 * proves the content satisfies it.
 */

/** How wide the surface is allowed to get. */
export type ModalBranchSize = "xs" | "sm" | "md" | "lg" | "cover"

/** Props for {@link ModalBranch}. */
export type ModalBranchProps<K extends ContractKey> = ContractBranchProps<K> & {
    /** Whether the surface is on screen. Owned by whoever mounts it, never by the branch. */
    readonly isOpen: boolean
    /** How wide it may get. */
    readonly size?: ModalBranchSize
    /** Every way out: the close control, Escape, and the backdrop. */
    readonly onDismiss: () => void
}

/** Draw the vendor modal mechanics around one checked content contract. */
export const ModalBranch = <const K extends ContractKey>(input: ModalBranchProps<K>) => (
    <Modal
        isOpen={input.isOpen}
        onOpenChange={(open: boolean) => {
            if (!open) input.onDismiss()
        }}
    >
        <Modal.Backdrop>
            <Modal.Container size={input.size ?? "md"} placement="center">
                <Modal.Dialog
                    data-tier="branch"
                    data-component="ModalBranch"
                    className={input.size === "cover" ? "p-4" : undefined}
                >
                    <Modal.CloseTrigger />
                    <Modal.Body className="p-0">
                        <Tree contract={input.contract} render={input.render} />
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    </Modal>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", mechanics: true, world: "pure" } as const

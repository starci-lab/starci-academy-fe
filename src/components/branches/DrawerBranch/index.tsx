import { Drawer } from "@heroui/react"
import { Tree } from "@/components/branches/Tree"
import type { ContractKey } from "@/components/contracts"
import type { ContractBranchProps } from "@/components/contracts/props"

/**
 * BRANCH - `DrawerBranch`: the vendor's edge-anchored mechanics around one typed contract.
 *
 * Target path: `src/components/branches/DrawerBranch/index.tsx`.
 *
 * IT WRAPS `Drawer`, NOT `Modal` WITH A PLACEMENT. HeroUI 3.2.4 ships a real `Drawer` -
 * `Drawer.Backdrop`, `Drawer.Content` with its own `placement`, `Drawer.Dialog`, `Drawer.Header`,
 * `Drawer.Body`, `Drawer.Footer`, `Drawer.Handle`, `Drawer.CloseTrigger` - and this file was first
 * written against `Modal` with `placement="right"`. That would have been a second implementation
 * of a panel the vendor already ships: no drag handle, no edge-anchored enter and exit, and the
 * product's drawer behaving unlike every other drawer built on this library. `vendor-boundary` is
 * the rule and this is the reason behind it - reach for the vendor's own component before
 * assembling one out of its neighbour.
 *
 * IT IMPLEMENTS NONE OF THOSE MECHANICS ITSELF, exactly as `ModalBranch` does not: no effect, no
 * ref, no scroll handling. All of it belongs to the vendor, which is what stops two overlays in
 * this product disagreeing about how a covering surface behaves. The interior still stays closed:
 * a contract key and its typed render replace the former anonymous children hole.
 */

/** Which edge the panel is anchored to. */
export type DrawerBranchPlacement = "left" | "right" | "bottom"

/** Props for {@link DrawerBranch}. */
export type DrawerBranchProps<K extends ContractKey> = ContractBranchProps<K> & {
    /** Whether the drawer is showing. Owned by whoever mounts it, never by the branch. */
    readonly isOpen: boolean
    /** The edge it opens from. Absent is `right`, which is where this product's basket lives. */
    readonly placement?: DrawerBranchPlacement
    /** The already-resolved title. A drawer names itself; the interior does not repeat it. */
    readonly title: string
    /** Every way out: the close control, Escape, and the backdrop. */
    readonly onDismiss: () => void
}

/**
 * Open the vendor's panel from the edge.
 *
 * @param input - {@link DrawerBranchProps}
 */
export const DrawerBranch = <const K extends ContractKey>(input: DrawerBranchProps<K>) => (
    <Drawer
        isOpen={input.isOpen}
        onOpenChange={(open) => {
            if (!open) input.onDismiss()
        }}
    >
        <Drawer.Backdrop>
            <Drawer.Content placement={input.placement ?? "right"}>
                <Drawer.Dialog data-tier="branch" data-component="DrawerBranch">
                    <Drawer.Header>
                        <Drawer.Heading>{input.title}</Drawer.Heading>
                    </Drawer.Header>
                    <Drawer.CloseTrigger />
                    {/*
                     * The vendor inset is zeroed for the same reason `ModalBranch` zeroes it: the
                     * interior owns its own padding, so a branch that also padded would inset the
                     * same content twice and the two insets would drift apart.
                     */}
                    <Drawer.Body className="p-0">
                        <Tree contract={input.contract} render={input.render} />
                    </Drawer.Body>
                </Drawer.Dialog>
            </Drawer.Content>
        </Drawer.Backdrop>
    </Drawer>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", mechanics: true, world: "pure" } as const

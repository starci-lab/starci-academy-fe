import type { ReactNode } from "react"
import { Drawer } from "@heroui/react"
import { drawerBodyClassName } from "./classNames"

/**
 * BRANCH - `DrawerBranch`: the vendor's edge-anchored mechanics around typed children.
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
 * children are passed directly so the branch remains a small vendor-mechanics wrapper.
 */

/** Which edge the panel is anchored to. */
export type DrawerBranchPlacement = "left" | "right" | "bottom"

/** Props for {@link DrawerBranch}. */
export type DrawerBranchProps = {
    /** Whether the drawer is showing. Owned by whoever mounts it, never by the branch. */
    readonly isOpen: boolean
    /** The edge it opens from. Absent is `right`, which is where this product's basket lives. */
    readonly placement?: DrawerBranchPlacement
    /** The already-resolved title. A drawer names itself; the interior does not repeat it. */
    readonly title: string
    /** Every way out: the close control, Escape, and the backdrop. */
    readonly onDismiss: () => void
    readonly children: ReactNode
}

/**
 * Open the vendor's panel from the edge.
 *
 * @param input - {@link DrawerBranchProps}
 */
export const DrawerBranch = (props: DrawerBranchProps) => (
    <Drawer
        isOpen={props.isOpen}
        onOpenChange={(open) => {
            if (!open) props.onDismiss()
        }}
    >
        <Drawer.Backdrop>
            <Drawer.Content placement={props.placement ?? "right"}>
                <Drawer.Dialog>
                    <Drawer.Header>
                        <Drawer.Heading>{props.title}</Drawer.Heading>
                    </Drawer.Header>
                    <Drawer.CloseTrigger />
                    {/*
                     * The vendor inset is zeroed for the same reason `ModalBranch` zeroes it: the
                     * interior owns its own padding, so a branch that also padded would inset the
                     * same content twice and the two insets would drift apart.
                     */}
                    <Drawer.Body className={drawerBodyClassName}>
                        {props.children}
                    </Drawer.Body>
                </Drawer.Dialog>
            </Drawer.Content>
        </Drawer.Backdrop>
    </Drawer>
)

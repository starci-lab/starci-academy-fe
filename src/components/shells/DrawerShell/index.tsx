import type { ReactNode } from "react"
import { Drawer } from "@heroui/react"

/**
 * SHELL - `DrawerShell`: the vendor's edge-anchored covering mechanics, wrapped once.
 *
 * Target path: `src/components/shells/DrawerShell/index.tsx`.
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
 * IT IS A SIBLING OF `ModalShell` rather than a prop on it, and canon settles that rather than
 * taste: `props-and-slots` SLOTS-4 names exactly three components that may expose `children` -
 * `ModalShell`, `DrawerShell` and `DropdownShell` - so the drawer was vocabulary before it was
 * written.
 *
 * IT IS AN UNTYPED INTERIOR HOLE, deliberately. A drawer owns focus trapping, Escape, backdrop
 * dismissal, scroll locking and placement, but it neither knows nor arranges what is mounted in
 * the vendor body's `children` slot.
 *
 * IT IMPLEMENTS NONE OF THOSE MECHANICS ITSELF, exactly as `ModalShell` does not: no effect, no
 * ref, no scroll handling. All of it belongs to the vendor, which is what stops two overlays in
 * this product disagreeing about how a covering surface behaves.
 */

/** Which edge the panel is anchored to. */
export type DrawerShellPlacement = "left" | "right" | "bottom"

/** Props for {@link DrawerShell}. */
export type DrawerShellProps = {
    /** Whether the drawer is showing. Owned by whoever mounts it, never by the shell. */
    readonly isOpen: boolean
    /** The edge it opens from. Absent is `right`, which is where this product's basket lives. */
    readonly placement?: DrawerShellPlacement
    /** The already-resolved title. A drawer names itself; the interior does not repeat it. */
    readonly title: string
    /** Content passed straight to the vendor body without inspection or arrangement. */
    readonly children?: ReactNode
    /** Every way out: the close control, Escape, and the backdrop. */
    readonly onDismiss: () => void
}

/**
 * Open the vendor's panel from the edge.
 *
 * @param input - {@link DrawerShellProps}
 */
export const DrawerShell = (input: DrawerShellProps) => (
    <Drawer
        isOpen={input.isOpen}
        onOpenChange={(open) => {
            if (!open) input.onDismiss()
        }}
    >
        <Drawer.Backdrop>
            <Drawer.Content placement={input.placement ?? "right"}>
                <Drawer.Dialog data-tier="shell" data-component="DrawerShell">
                    <Drawer.Header>
                        <Drawer.Heading>{input.title}</Drawer.Heading>
                    </Drawer.Header>
                    <Drawer.CloseTrigger />
                    {/*
                     * The vendor inset is zeroed for the same reason `ModalShell` zeroes it: the
                     * interior owns its own padding, so a shell that also padded would inset the
                     * same content twice and the two insets would drift apart.
                     */}
                    <Drawer.Body className="p-0">{input.children}</Drawer.Body>
                </Drawer.Dialog>
            </Drawer.Content>
        </Drawer.Backdrop>
    </Drawer>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "shell", mechanics: true, world: "pure" } as const

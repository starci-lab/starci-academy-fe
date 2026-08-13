import { ModalShell } from "@/components/shells/ModalShell"
import { ContractContent } from "@/components/branches/Tree"
import type { ContractKey } from "@/components/contracts"
import type { ContractComponent } from "@/components/contracts/props"

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
 * `ModalShell`'s, which is what stops two overlays disagreeing about how a modal behaves.
 *
 * `sm` RATHER THAN `xs`, because the body is a reckoning read line by line - a label and an amount
 * per row - and at `xs` the amounts wrap under their labels, which is the moment the column stops
 * being a column.
 */

/** Props for {@link _CoursePriceOverlay}. */
export type CoursePriceOverlayProps<K extends ContractKey> = {
    /** Whether the surface is on screen. Owned by whoever mounts it, never by the surface. */
    readonly isOpen: boolean
    /** Typed branch mounted inside the otherwise content-agnostic modal shell. */
    readonly render: ContractComponent<K>
    /** Every way out: the close control, Escape and the backdrop. */
    readonly onDismiss: () => void
}

/**
 * Draw the covering surface.
 *
 * @param input - {@link CoursePriceOverlayProps}
 */
export const _CoursePriceOverlay = <const K extends ContractKey>(input: CoursePriceOverlayProps<K>) => (
    <ModalShell isOpen={input.isOpen} size="sm" onDismiss={input.onDismiss}>
        <ContractContent contract={input.render.meta.contract} render={input.render} />
    </ModalShell>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", world: "pure", domain: "courses" } as const

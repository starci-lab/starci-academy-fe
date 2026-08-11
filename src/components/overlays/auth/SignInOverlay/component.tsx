import { ModalShell } from "@/components/shells/ModalShell"
import { Tree } from "@/components/branches/Tree"
import type { ContractKey } from "@/components/contracts"
import type { ContractComponent } from "@/components/contracts/props"

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
 * are `ModalShell`'s, wrapped once at the shell tier - which is what stops two surfaces disagreeing
 * about how a modal behaves.
 */

/** Props for {@link _SignInOverlay}. */
export type SignInOverlayProps<K extends ContractKey> = {
    /** Whether the surface is on screen. Owned by whoever mounts it, never by the surface. */
    readonly isOpen: boolean
    /** Typed branch mounted inside the otherwise content-agnostic modal shell. */
    readonly render: ContractComponent<K>
    /** Every way out: the close control, Escape, the backdrop, and a successful sign-in. */
    readonly onDismiss: () => void
}

/**
 * Draw the covering surface.
 *
 * @param input - {@link SignInOverlayProps}
 */
export const _SignInOverlay = <const K extends ContractKey>(input: SignInOverlayProps<K>) => (
    <ModalShell isOpen={input.isOpen} size="xs" onDismiss={input.onDismiss}>
        <Tree contract={input.render.meta.contract} render={input.render} />
    </ModalShell>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", world: "pure", domain: "auth" } as const

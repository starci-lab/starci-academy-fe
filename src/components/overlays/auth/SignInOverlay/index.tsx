"use client"

import { useCallback, useRef } from "react"
import { AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel"
import { Button } from "@/components/atoms/Button"
import type { SignInCompositionChain, ContractSlotProps } from "@/components/contracts"
import { _SignInOverlay, type SignInOverlayLabels } from "./component"

/**
 * OVERLAY - `SignInOverlay`, connected half.
 *
 * It wires two things together and owns neither: the surface, which knows how a reader gets out,
 * and the panel, which knows how a reader gets in. Two decisions are made here and both are about
 * the seam between them:
 *
 *   1. signing in successfully is ALSO a way out, so `onSignedIn` ends at the same callback the
 *      close control does, and a reader is never left looking at a confirmation they have to
 *      dismiss by hand;
 *   2. the close control belongs on the panel's title line, so it is built here and handed DOWN as
 *      the panel's title-line slot rather than drawn beside it. That is the one thing the floating
 *      composition has and the routed one does not, and it is why the panel takes a slot at all.
 *
 * WHY BOTH SLOTS ARE PINNED. The surface mounts its body as a COMPONENT, so a body whose identity
 * changes is a body that remounts - and remounting this one throws away a challenge the reader is
 * part way through answering. The dismiss callback is therefore read through a ref rather than
 * closed over, which is what lets both slots be built exactly once however often a caller
 * re-renders with a fresh handler.
 */

/** Copy the floating composition renders. It moves to the translation tier when that tier exists. */
const LABELS: SignInOverlayLabels = {
    dismiss: "Close",
}

/**
 * This surface's entry in the sign-in chain: the floating composition is the overlay with the
 * authentication panel inside it.
 *
 * The two facts are declared together because they are one arrangement, and the compiler holds
 * both: `SignInOverlayProps` is the only surface props type carrying `isOpen` and `onDismiss`, and
 * the body is the CONNECTED panel rather than its presentational half - swap in
 * `_AuthenticationPanel` and the entry stops compiling, because this surface resolves no copy and
 * runs no request it could pass down.
 */
export const signInOverlayChain: SignInCompositionChain = {
    name: "sign-in-overlay",
    surface: _SignInOverlay,
    body: AuthenticationPanel,
}

/** Props for {@link SignInOverlay}. */
export interface SignInOverlayConnectedProps {
    /** Whether the overlay is on screen. */
    isOpen: boolean
    /** Called for every way out, including a successful sign-in. */
    onDismiss: () => void
}

/**
 * Summon the authentication panel onto a floating surface.
 *
 * @param props - {@link SignInOverlayConnectedProps}
 */
export const SignInOverlay = ({ isOpen, onDismiss }: SignInOverlayConnectedProps) => {
    const dismiss = useRef(onDismiss)
    dismiss.current = onDismiss

    /** Stable for the life of the overlay; the current handler is read at call time. */
    const onSignedIn = useCallback(() => {
        dismiss.current()
    }, [])

    /** The way out that is visible, drawn on the panel's own title line. */
    const Dismiss = useCallback(({ isLoading }: ContractSlotProps) => (
        <Button
            variant="ghost"
            size="sm"
            icon="close"
            isLoading={isLoading}
            onClick={() => dismiss.current()}
        >
            {LABELS.dismiss}
        </Button>
    ), [])

    /**
     * The `body` slot of the surface: the panel, which closes the overlay once it succeeds and
     * carries the overlay's close control on its title line.
     */
    const Body = useCallback(() => (
        <AuthenticationPanel onSignedIn={onSignedIn} slots={{ action: Dismiss }} />
    ), [onSignedIn, Dismiss])

    return (
        <_SignInOverlay
            isOpen={isOpen}
            slots={{ body: Body }}
            onDismiss={onDismiss}
        />
    )
}

"use client"

import { useCallback, useRef } from "react"
import { SignInFlow } from "@/components/overlays/auth/SignInFlow"
import type { SignInCompositionChain } from "@/components/classNames"
import { _SignInOverlay, type SignInOverlayLabels } from "./component"

/**
 * OVERLAY - `SignInOverlay`, connected half.
 *
 * It wires two things together and owns neither: the surface, which knows how a reader gets
 * out, and the flow, which knows how a reader gets in. The only decision made here is that
 * signing in successfully is also a way out - so `onSignedIn` ends at the same callback the
 * close control does, and a reader is never left looking at a confirmation they have to
 * dismiss by hand.
 *
 * WHY THE BODY SLOT IS PINNED. The registry frame mounts a slot as a COMPONENT, so a slot
 * whose identity changes is a slot that remounts - and remounting this one throws away a
 * challenge the reader is part way through answering. The dismiss callback is therefore read
 * through a ref rather than closed over, which is what lets the slot be built exactly once
 * however often a caller re-renders with a fresh handler.
 *
 * WHERE THIS IS MOUNTED. Nowhere yet. The surface that summons it is the application shell,
 * which lives in files this work does not own; until it does, `/authentication` is the route
 * that renders the same flow without the dialog around it.
 */

/** Copy the overlay renders. It moves to the translation tier when that tier exists. */
const LABELS: SignInOverlayLabels = {
    title: "Sign in",
    dismiss: "Close",
}

/**
 * This surface's entry in the sign-in chain: the floating composition is the overlay with the
 * connected flow inside it.
 *
 * The two facts are declared together because they are one arrangement, and the compiler holds
 * both: `SignInOverlayProps` is the only surface props type carrying `isOpen` and `onDismiss`,
 * and the body is the CONNECTED flow rather than its presentational half - swap in
 * `_SignInFlow` and the entry stops compiling, because this surface resolves no copy and runs
 * no request it could pass down.
 */
export const signInOverlayChain: SignInCompositionChain = {
    name: "sign-in-overlay",
    surface: _SignInOverlay,
    body: SignInFlow,
}

/** Props for {@link SignInOverlay}. */
export interface SignInOverlayConnectedProps {
    /** Whether the overlay is on screen. */
    isOpen: boolean
    /** Called for every way out, including a successful sign-in. */
    onDismiss: () => void
}

/**
 * Summon the sign-in flow onto a floating surface.
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

    /** The `body` slot of the overlay: the flow, which closes the surface once it succeeds. */
    const Body = useCallback(() => <SignInFlow onSignedIn={onSignedIn} />, [onSignedIn])

    return (
        <_SignInOverlay
            isOpen={isOpen}
            labels={LABELS}
            slots={{ body: Body }}
            onDismiss={onDismiss}
        />
    )
}

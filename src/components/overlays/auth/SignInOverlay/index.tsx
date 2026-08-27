"use client"

import { useCallback, useRef } from "react"
import { AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel"
import type { AuthMode } from "@/components/blocks/auth/AuthenticationPanel/component"
import { SignInOverlayView } from "./component"

/**
 * OVERLAY - `SignInOverlay`, connected half.
 *
 * It resolves one thing: that being signed in is also a way out. The panel reports success, the
 * surface closes, and the bar that opened it never learns why - which is what keeps the bar from
 * growing an opinion about authentication.
 */

/** Props for {@link SignInOverlay}. */
export type SignInOverlayProps = {
    /** Whether the surface is on screen. Owned by the bar. */
    readonly isOpen: boolean
    /** Journey selected before the covering surface opens. */
    readonly initialMode?: AuthMode
    /** Every way out. */
    readonly onDismiss: () => void
}

/**
 * Mount the panel inside the covering surface.
 *
 * @param props - {@link SignInOverlayProps}
 */
export const SignInOverlay = (props: SignInOverlayProps) => {
    // Held in a ref so the callback handed to the panel keeps one identity: a changing prop would
    // remount the panel, and a reader part way through a one-time code would lose it.
    const dismiss = useRef(props.onDismiss)
    dismiss.current = props.onDismiss

    const onSignedIn = useCallback(() => {
        dismiss.current()
    }, [])

    return (
        <SignInOverlayView isOpen={props.isOpen} onDismiss={props.onDismiss}>
            {props.isOpen ? <AuthenticationPanel initialMode={props.initialMode ?? "signIn"} onSignedIn={onSignedIn} /> : null}
        </SignInOverlayView>
    )
}

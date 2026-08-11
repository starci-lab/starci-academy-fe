"use client"

import { useCallback, useRef } from "react"
import { AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel"
import type { AuthMode } from "@/components/blocks/auth/AuthenticationPanel/component"
import { defineContractProjection } from "@/components/contracts/props"
import { _SignInOverlay } from "./component"

/**
 * OVERLAY - `SignInOverlay`, connected half.
 *
 * It resolves one thing: that being signed in is also a way out. The panel reports success, the
 * surface closes, and the bar that opened it never learns why - which is what keeps the bar from
 * growing an opinion about authentication.
 */

/** Props for {@link SignInOverlay}. */
export type SignInOverlayConnectedProps = {
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
 * @param input - {@link SignInOverlayConnectedProps}
 */
export const SignInOverlay = ({ isOpen, initialMode = "signIn", onDismiss }: SignInOverlayConnectedProps) => {
    // Held in a ref so the callback handed to the panel keeps one identity: a changing prop would
    // remount the panel, and a reader part way through a one-time code would lose it.
    const dismiss = useRef(onDismiss)
    dismiss.current = onDismiss

    const onSignedIn = useCallback(() => {
        dismiss.current()
    }, [])

    return (
        <_SignInOverlay
            isOpen={isOpen}
            onDismiss={onDismiss}
            render={defineContractProjection("centred-page-column", () => (
                /*
                 * Mounted only while the surface is open, not merely hidden with it. The panel
                 * runs the auth machine, and a second copy of every field id must not remain in
                 * the document behind a closed surface.
                 */
                isOpen ? <AuthenticationPanel initialMode={initialMode} onSignedIn={onSignedIn} /> : null
            ))}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "auth" } as const

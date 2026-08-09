"use client"

import { useCallback, useState } from "react"
import { SignInOverlay } from "@/components/overlays/auth/SignInOverlay"
import { _ShellNav, type ShellNavLabels } from "./component"

/**
 * LAYOUT - `ShellNav`, connected half.
 *
 * It owns one fact and nothing else: whether the sign-in overlay is on screen. That state lives
 * here rather than in the root layout because the layout is a server component - it cannot hold
 * state - and rather than in the overlay itself, because a surface that decided whether it was
 * open would leave the control that opens it with nothing to press.
 *
 * WHY OPENING AND CLOSING ARE STABLE CALLBACKS. The registry frame mounts slots as COMPONENTS, so
 * a handler whose identity changed on every render would remount the control it sits on. These
 * two never change, so the bar is drawn once and only the overlay re-renders when the flag moves.
 */

/** Copy the bar renders. It moves to the translation tier when that tier exists. */
const LABELS: ShellNavLabels = {
    brand: "StarCi Academy",
    signIn: "Sign in",
}

/**
 * The application shell's navigation bar, with the sign-in overlay hanging off it.
 */
export const ShellNav = () => {
    const [isOpen, setIsOpen] = useState(false)

    /** Opening is the only thing the bar itself can do to the overlay. */
    const onOpenSignIn = useCallback(() => {
        setIsOpen(true)
    }, [])

    /**
     * Every way out ends here - the close control, Escape, and a successful sign-in, which the
     * overlay routes to the same callback because being signed in is also a way out.
     */
    const onDismiss = useCallback(() => {
        setIsOpen(false)
    }, [])

    /**
     * The overlay slot. Its identity changes only when the flag does, so nothing inside it is
     * remounted while a reader is part way through answering a challenge.
     */
    const Overlay = useCallback(
        () => <SignInOverlay isOpen={isOpen} onDismiss={onDismiss} />,
        [isOpen, onDismiss],
    )

    return <_ShellNav labels={LABELS} slots={{ overlay: Overlay }} onOpenSignIn={onOpenSignIn} />
}

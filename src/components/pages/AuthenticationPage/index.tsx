"use client"

import { useCallback } from "react"
import { AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel"
import type { SignInCompositionChain } from "@/components/contracts"
import { _AuthenticationPage } from "./component"

/**
 * PAGE - `AuthenticationPage`, connected half.
 *
 * The page owns no request and no copy: the panel it renders fetches for itself and names itself,
 * so all that is left here is the one slot. It does not route away once the token is in hand
 * either - where a reader should land after signing in is a fact about where they came FROM, and
 * this page has not been told. Deciding it here would send everybody to the same place, which is
 * wrong for exactly the readers who were redirected here from somewhere else.
 *
 * It hands the panel NO title-line slot, which is the whole difference between this surface and the
 * floating one: a page that is already the screen has no way out to draw.
 */

/**
 * This surface's entry in the sign-in chain: the routed composition is the page with the same
 * connected panel inside it.
 *
 * Naming the body here is what stops the routed surface quietly growing a second copy of the
 * panel: both entries pin `AuthenticationPanel`, so a divergence has to be written as a new chain
 * member and argued, rather than appearing as one more import nobody compares.
 */
export const signInPageChain: SignInCompositionChain = {
    name: "sign-in-page",
    surface: _AuthenticationPage,
    body: AuthenticationPanel,
}

/**
 * The authentication surface.
 */
export const AuthenticationPage = () => {
    /** Built once, so a re-render of the page never restarts a challenge in progress. */
    const Body = useCallback(() => <AuthenticationPanel />, [])

    return <_AuthenticationPage slots={{ body: Body }} />
}

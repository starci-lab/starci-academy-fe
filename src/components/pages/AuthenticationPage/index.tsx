"use client"

import { useCallback } from "react"
import { SignInFlow } from "@/components/overlays/auth/SignInFlow"
import type { SignInCompositionChain } from "@/components/classNames"
import { _AuthenticationPage, type AuthenticationPageLabels } from "./component"

/**
 * PAGE - `AuthenticationPage`, connected half.
 *
 * The page owns no request: the flow it renders fetches for itself, so all that is left here
 * is the copy and the one slot. It does not route away once the token is in hand either -
 * where a reader should land after signing in is a fact about where they came FROM, and this
 * page has not been told. Deciding it here would send everybody to the same place, which is
 * wrong for exactly the readers who were redirected here from somewhere else.
 */

/** Copy the page renders. It moves to the translation tier when that tier exists. */
const LABELS: AuthenticationPageLabels = {
    title: "Sign in",
}

/**
 * This surface's entry in the sign-in chain: the routed composition is the page with the same
 * connected flow inside it.
 *
 * Naming the body here is what stops the routed surface quietly growing a second copy of the
 * flow: both entries pin `SignInFlow`, so a divergence has to be written as a new chain member
 * and argued, rather than appearing as one more import nobody compares.
 */
export const signInPageChain: SignInCompositionChain = {
    name: "sign-in-page",
    surface: _AuthenticationPage,
    body: SignInFlow,
}

/**
 * The authentication surface.
 */
export const AuthenticationPage = () => {
    /** Built once, so a re-render of the page never restarts a challenge in progress. */
    const Body = useCallback(() => <SignInFlow />, [])

    return <_AuthenticationPage labels={LABELS} slots={{ body: Body }} />
}

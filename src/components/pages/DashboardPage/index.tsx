"use client"

import { setSessionToken, useSessionToken } from "@/hooks/auth/useSessionToken"
import { _DashboardPage, type DashboardPageLabels } from "./component"

/**
 * PAGE - `DashboardPage`, connected half.
 *
 * The page owns no request of its own: every figure on screen belongs to a block that
 * fetches it. What it does own is the ONE fact none of those blocks can settle for
 * themselves - whether there is a session at all. Every query behind this screen is
 * auth-gated, so without a token they do not fail slowly, they fail forever: SWR retries a
 * rejected key on a backoff and reports `isLoading` again each time, which is how a signed-out
 * dashboard ends up shimmering at a reader who is not waiting for anything.
 *
 * Reading the token here answers that once, before a single request is made, and hands the
 * presentational half a settled fact rather than four regions of guesswork.
 */

/** Copy the dashboard renders. It moves to the translation tier when that tier exists. */
const LABELS: DashboardPageLabels = {
    title: "Dashboard",
    progressHeading: "Your progress",
    railHeading: "Your standing",
    signOut: "Sign out",
    signedOutTitle: "Sign in to see your dashboard",
    signIn: "Sign in",
}

/**
 * The dashboard surface.
 */
export const DashboardPage = () => {
    const token = useSessionToken()

    /** Ending the session is the whole of it: the store wakes every reader of the token. */
    const onSignOut = () => {
        setSessionToken(undefined)
    }

    return <_DashboardPage labels={LABELS} isSignedOut={token === undefined} onSignOut={onSignOut} />
}

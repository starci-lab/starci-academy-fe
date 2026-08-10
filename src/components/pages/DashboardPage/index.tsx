"use client"

import { useTranslations } from "next-intl"
import { setSessionToken, useSessionToken } from "@/hooks/auth/useSessionToken"
import { _DashboardPage, type DashboardTab } from "./component"
import type { IconName } from "@/components/leaves/Icon"

/**
 * PAGE - `DashboardPage`, connected half.
 *
 * It resolves the one fact the screen owns - whether there is a session - and hands the other half
 * a settled situation rather than four regions of guesswork.
 */

/** The sections of the dashboard, in reading order. */
const TABS: ReadonlyArray<{ id: string, icon: IconName, href: string }> = [
    { id: "overview", icon: "home", href: "/dashboard" },
    { id: "explore", icon: "explore", href: "/dashboard/explore" },
    { id: "courses", icon: "course", href: "/dashboard/courses" },
    { id: "community", icon: "community", href: "/dashboard/community" },
]

/**
 * Resolve the session and draw the dashboard.
 */
export const DashboardPage = () => {
    const t = useTranslations("dashboard")
    const tShell = useTranslations("shell")
    const token = useSessionToken()

    const tabs: ReadonlyArray<DashboardTab> = TABS.map((tab) => ({
        id: tab.id,
        icon: tab.icon,
        href: tab.href,
        label: tShell(`tabs.${tab.id}`),
        // Only the overview is built. The other three are declared so the strip is honest about
        // what the product has, and they route rather than pretending to switch in place.
        isCurrent: tab.id === "overview",
    }))

    const title = t("title")

    if (token === undefined) {
        return (
            <_DashboardPage
                state="signedOut"
                props={{ title, tabs, message: t("signedOutTitle"), signInLabel: t("signIn") }}
            />
        )
    }

    return (
        <_DashboardPage
            state="signedIn"
            props={{ title, tabs, signOutLabel: t("signOut") }}
            // Ending the session is the whole of it: the store wakes every reader of the token.
            on={{ signOut: () => setSessionToken(undefined) }}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "dashboard" } as const

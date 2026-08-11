"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
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
    { id: "overview", icon: "home", href: "/dashboard?tab=overview" },
    { id: "explore", icon: "explore", href: "/dashboard?tab=explore" },
    { id: "courses", icon: "course", href: "/dashboard?tab=courses" },
    { id: "community", icon: "community", href: "/dashboard?tab=community" },
]

/**
 * Resolve the session and draw the dashboard.
 */
export const DashboardPage = () => {
    const t = useTranslations("dashboard")
    const tShell = useTranslations("shell")
    const token = useSessionToken()
    const router = useRouter()
    const searchParams = useSearchParams()
    const requestedTab = searchParams.get("tab")
    const selectedTab = TABS.some((tab) => tab.id === requestedTab) ? requestedTab! : "overview"

    const tabs: ReadonlyArray<DashboardTab> = TABS.map((tab) => ({
        id: tab.id,
        icon: tab.icon,
        href: tab.href,
        label: tShell(`tabs.${tab.id}`),
        isCurrent: tab.id === selectedTab,
    }))

    useEffect(() => {
        if (token === undefined) router.replace("/authentication")
    }, [router, token])

    if (token === undefined) return null

    return (
        <_DashboardPage
            props={{ tabs, selectedTab, unavailableMessage: t("unavailable") }}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "dashboard" } as const

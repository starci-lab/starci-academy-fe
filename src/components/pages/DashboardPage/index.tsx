"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { useSessionRefresh } from "@/hooks/auth/useSessionRefresh"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { _DashboardPage } from "./component"

/**
 * PAGE - `DashboardPage`, connected half.
 *
 * It resolves the one fact the screen owns - whether there is a session - and hands the other half
 * a settled situation rather than four regions of guesswork.
 */

/** The sections of the dashboard, in reading order. */
const TAB_IDS = ["overview", "explore", "courses", "community"] as const

/**
 * Resolve the session and draw the dashboard.
 */
export const DashboardPage = () => {
    const t = useTranslations("dashboard")
    const token = useSessionToken()
    const session = useSessionRefresh()
    const router = useRouter()
    const searchParams = useSearchParams()
    const requestedTab = searchParams.get("tab")
    const selectedTab = TAB_IDS.some((id) => id === requestedTab) ? requestedTab! : "overview"

    useEffect(() => {
        if (!session.isRestoring && token === undefined) router.replace("/authentication")
    }, [router, session.isRestoring, token])

    if (session.isRestoring || token === undefined) return null

    return (
        <_DashboardPage
            props={{ selectedTab, unavailableMessage: t("unavailable") }}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "dashboard" } as const

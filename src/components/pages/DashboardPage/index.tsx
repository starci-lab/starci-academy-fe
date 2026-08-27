"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useSessionRefresh } from "@/hooks/auth/useSessionRefresh"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { DashboardPageBase } from "./component"

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
/** Props for the URL-owned dashboard page. */
export type DashboardPageProps = Record<never, never>
/** Render the connected dashboard route. */
export const DashboardPage = (props: DashboardPageProps) => {
    void props
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
        <DashboardPageBase
            props={{ selectedTab, unavailableMessage: t("unavailable") }}
        />
    )
}

"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
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
const TAB_IDS = ["overview", "explore", "bulletin", "courses", "community"] as const
const compactDashboardRailQuery = "(max-width: 69.999rem)"

const subscribeToCompactDashboardRail = (onStoreChange: () => void) => {
    if (typeof window === "undefined") return () => undefined
    const query = window.matchMedia(compactDashboardRailQuery)
    query.addEventListener("change", onStoreChange)
    return () => query.removeEventListener("change", onStoreChange)
}

const getCompactDashboardRailSnapshot = () => (
    typeof window === "undefined" ? false : window.matchMedia(compactDashboardRailQuery).matches
)

const getCompactDashboardRailServerSnapshot = () => false

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
    const isCompactRail = useSyncExternalStore(
        subscribeToCompactDashboardRail,
        getCompactDashboardRailSnapshot,
        getCompactDashboardRailServerSnapshot,
    )
    const [isRailOpen, setRailOpen] = useState(false)

    useEffect(() => {
        if (!session.isRestoring && token === undefined) router.replace("/authentication")
    }, [router, session.isRestoring, token])

    useEffect(() => {
        if (!isCompactRail && isRailOpen) setRailOpen(false)
    }, [isCompactRail, isRailOpen])

    useEffect(() => {
        setRailOpen(false)
    }, [selectedTab])

    if (session.isRestoring || token === undefined) return null

    return (
        <DashboardPageBase
            props={{
                selectedTab,
                unavailableMessage: t("unavailable"),
                railLabel: t("railHeading"),
                railPresentation: isCompactRail ? "drawer" : "inline",
                railOpenLabel: t("openRail"),
                railCloseLabel: t("closeRail"),
                backLabel: t("back"),
                isRailOpen,
            }}
            on={{ setRailOpen, goBack: () => router.back() }}
        />
    )
}

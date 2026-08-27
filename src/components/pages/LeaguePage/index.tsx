"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useSessionRefresh } from "@/hooks/auth/useSessionRefresh"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { LeaguePageBase, type LeagueScope } from "./component"

const SCOPES = ["weekly", "global"] as const

/** Resolve URL scope/auth and compose the page shell; board state lives in LeagueBlock. */
/** Props for the URL-owned league page. */
export type LeaguePageProps = Record<never, never>
/** Render the connected league route. */
export const LeaguePage = (props: LeaguePageProps) => {
    void props
    const t = useTranslations("community")
    const router = useRouter()
    const requested = useSearchParams().get("scope")
    const scope: LeagueScope = SCOPES.some((id) => id === requested) ? requested as LeagueScope : "weekly"
    const token = useSessionToken()
    const session = useSessionRefresh()
    useEffect(() => { if (!session.isRestoring && token === undefined) router.replace("/authentication") }, [router, session.isRestoring, token])
    if (session.isRestoring || token === undefined) return null
    return <LeaguePageBase
        title={t("pageTitle")}
        trail={[{ id: "home", label: t("breadcrumbHome") }, { id: "league", label: t("pageTitle") }]}
        scopeLabel={t("pageTitle")}
        scope={scope}
        weeklyLabel={t("tabWeekly")}
        globalLabel={t("tabGlobal")}
        on={{ selectScope: (key) => router.push(`/league?scope=${key === "global" ? "global" : "weekly"}`), goHome: () => router.push("/dashboard") }}
    />
}

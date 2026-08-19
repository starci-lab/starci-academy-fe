"use client"

import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useQueryResolveRouteSwr, useQueryTrendingContentsSwr } from "@/hooks"
import { TrendingContentsBase } from "./component"

/** Load ranked content and resolve its internal routes on demand. */
export const TrendingContents = () => {
    const t = useTranslations("dashboard.explore")
    const router = useRouter()
    const query = useQueryTrendingContentsSwr()
    const route = useQueryResolveRouteSwr()
    if (query.error !== undefined || query.data?.length === 0) return <TrendingContentsBase state="hidden" props={{ label: t("trending"), items: [] }} />
    const items = (query.data ?? []).slice(0, 6).map((item, index) => ({
        id: item.globalId,
        rank: String(index + 1),
        title: item.title,
        isTopRank: index < 3,
    }))
    const on = Object.fromEntries((query.data ?? []).map((item) => [item.globalId, async () => {
        const result = await route.trigger({ globalId: item.globalId })
        const path = result.data?.resolveRoute?.data?.path
        if (path !== null && path !== undefined) router.push(path)
    }]))
    return <TrendingContentsBase state={query.data === undefined ? "pending" : "ready"} props={{ label: t("trending"), items }} on={on} />
}
/** Source-level ownership marker for the connected discovery block. */
export const meta = { world: "connected", domain: "discovery" } as const

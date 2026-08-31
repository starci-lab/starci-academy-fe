"use client"

import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useQueryResolveRouteSwr, useQueryTrendingContentsSwr } from "@/hooks"
import { TrendingContentsBase } from "./component"

/** Load ranked content and resolve its internal routes on demand. */
/** Props for the connected trending contents block. */
export type TrendingContentsProps = Record<string, never>
/** Connect the TrendingContents block to its data source. */
export const TrendingContents = (props: TrendingContentsProps) => {
    void props
    const t = useTranslations("dashboard.explore")
    const router = useRouter()
    const query = useQueryTrendingContentsSwr()
    const route = useQueryResolveRouteSwr()
    const viewProps = { label: t("trending"), items: [], emptyMessage: `${t("trending")}: ${t("feedEmptyPlatformDescription")}`, errorMessage: t("feedFailed"), retryLabel: t("retry") }
    if (query.error !== undefined) return <TrendingContentsBase state="failed" props={viewProps} on={{ retry: () => { void query.mutate() } }} />
    if (query.data?.length === 0) return <TrendingContentsBase state="empty" props={viewProps} />
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
    return <TrendingContentsBase state={query.data === undefined ? "pending" : "ready"} props={{ ...viewProps, items }} on={on} />
}

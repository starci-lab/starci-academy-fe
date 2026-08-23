"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCodingDomainSummarySwr } from "@/hooks/swr/useQueryCodingDomainSummarySwr"
import { useQueryMyCodingProgressSwr } from "@/hooks/swr/useQueryMyCodingProgressSwr"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { DomainMasteryGridBase, type DomainMastery } from "./component"

/** Resolve catalog, viewer progress and the region's own recovery actions. */
export const DomainMasteryGrid = () => {
    const t = useTranslations("practice")
    const router = useRouter()
    const token = useSessionToken()
    const summary = useQueryCodingDomainSummarySwr()
    const progress = useQueryMyCodingProgressSwr()
    const solvedByDomain = useMemo(() => {
        const lookup = new Map<string, number>()
        for (const row of progress.data?.byDomain ?? []) lookup.set(row.domain, row.solved)
        return lookup
    }, [progress.data])
    const domains: ReadonlyArray<DomainMastery> = (summary.data?.domains ?? []).map((row) => {
        const solved = solvedByDomain.get(row.domain) ?? 0
        const name = t(`domains.${row.domain}`)
        return {
            id: row.domain,
            name,
            total: row.total,
            solved,
            countLabel: t("count", { solved, total: row.total }),
            label: t("openDomain", { name }),
            meterLabel: t("meter", { name }),
        }
    })
    const catalogFailed = summary.error !== undefined || summary.data === null
    const pending = summary.data === undefined && !catalogFailed
    const progressFailed = progress.error !== undefined || progress.data === null
    const state = pending
        ? "pending" as const
        : token === undefined
            ? "guest" as const
            : catalogFailed
                ? "catalog-failed" as const
                : domains.length === 0
                    ? "empty" as const
                    : progressFailed ? "progress-failed" as const : "ready" as const
    const notice = state === "guest"
        ? { noticeMessage: t("guestMessage"), noticeDescription: t("guestDetail"), noticeActionLabel: t("guestAction") }
        : state === "catalog-failed"
            ? { noticeMessage: t("catalogFailed"), noticeActionLabel: t("retry") }
            : state === "empty" ? { noticeMessage: t("noDomains") } : {}
    return <DomainMasteryGridBase
        state={state}
        props={{ domains, ...notice }}
        on={{
            open: (id) => router.push(`/practice/${id}`),
            recover: () => { if (state === "guest") router.push("/authentication"); else void summary.mutate() },
        }}
    />
}

export { DomainMasteryGridBase } from "./component"
export type { DomainMastery, DomainMasteryGridData, DomainMasteryGridActions, DomainMasteryGridState } from "./component"
/** Source-level ownership marker for the connected domain region. */
export const meta = { world: "connected", domain: "coding" } as const

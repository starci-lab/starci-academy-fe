"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCodingDomainSummarySwr } from "@/hooks/swr/useQueryCodingDomainSummarySwr"
import { useQueryMyCodingProgressSwr } from "@/hooks/swr/useQueryMyCodingProgressSwr"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { _CodingPracticeHubPage } from "./component"

/**
 * The practice hub, connected.
 *
 * IT READS TWO INDEPENDENT ANSWERS AND JOINS THEM HERE. `codingDomainSummary` is a catalog fact
 * with no viewer in it; `myCodingProgress` is the viewer and knows nothing about catalog sizes.
 * Joining them server-side would have made the catalog a personalised query and lost its cache.
 *
 * A DOMAIN WITH NO SOLVES HAS NO ROW, so `byDomain` is turned into a lookup and every topic defaults
 * to zero. Walking the summary rather than the progress is what makes a topic the learner has never
 * touched still appear - the alternative shows only what they have already done, which is the
 * opposite of what a hub is for.
 *
 * THE TOPICS LAND WITHOUT THE PROGRESS. The grid rests until the catalog arrives, then shows the
 * topics; if the viewer's own half fails, the totals stay and the personal figures are ABSENT rather
 * than zero, because zero is a claim.
 */
export const CodingPracticeHubPage = () => {
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

    const domains = (summary.data?.domains ?? []).map((row) => {
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

    /*
     * `null` IS A REFUSAL, NOT AN EMPTY ANSWER. The hook unwraps the envelope with `?? null`, so a
     * server that declines - and `codingDomainSummary` declines every request without a session -
     * lands here as `null`, exactly like a successful request carrying nothing would.
     *
     * The order below matters and was decided by the running page: a guest is a GUEST before it is
     * a failure, because "sign in" is a thing the reader can act on and "the catalog failed" is not.
     */
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
                    : progressFailed
                        ? "progress-failed" as const
                        : "ready" as const

    const notice = state === "guest"
        ? {
            noticeMessage: t("guestMessage"),
            noticeDescription: t("guestDetail"),
            noticeActionLabel: t("guestAction"),
        }
        : state === "catalog-failed"
            ? {
                noticeMessage: t("catalogFailed"),
                noticeActionLabel: t("retry"),
            }
            : state === "empty"
                ? { noticeMessage: t("noDomains") }
                : {}

    return (
        <_CodingPracticeHubPage
            session={token === undefined ? "guest" : "signed-in"}
            props={{
                labels: {
                    navHome: t("navHome"),
                    navPractice: t("title"),
                    title: t("title"),
                    standingLabel: t("standingLabel"),
                    standingMore: t("standingMore"),
                },
                domains: { state, items: domains, ...notice },
            }}
            on={{
                goHome: () => router.push("/dashboard"),
                openDomain: (id: string) => router.push(`/practice/${id}`),
                recoverDomains: () => {
                    if (state === "guest") router.push("/authentication")
                    else void summary.mutate()
                },
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "coding" } as const

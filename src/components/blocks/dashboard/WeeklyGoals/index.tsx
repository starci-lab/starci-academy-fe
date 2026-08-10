"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useQueryMyKpisSwr } from "@/hooks/swr/useQueryMyKpisSwr"
import { type MyKpiItem } from "@/modules/api/graphql/queries/types/my-kpis"
import { _WeeklyGoals } from "./component"
import type { LabelledProgressRowData } from "@/components/leaves/LabelledProgressRow"

/**
 * BLOCK - `WeeklyGoals`, connected half.
 *
 * It reads ONE request and settles ONE state. The distinction it owns is the one nothing
 * downstream can make: a week with no targets SET, versus a week that has not arrived.
 *
 * WHERE "HOW LONG LEFT" IS DECIDED. The server sends an instant; the arithmetic that turns it into
 * days and hours is here, and the words for those numbers are in the catalogue - because how many
 * forms a number takes is a fact about the language, not about the week.
 */

/** Where a reader goes to set or change a target. */
const KPI_HREF = "/kpi"

/**
 * Turn one metric into a row.
 *
 * Called only for metrics that HAVE a target - a caller passing an unset one would be asking for a
 * fraction with no denominator, which is the situation the `unset` state exists to draw instead.
 *
 * @param item - One metric of the payload.
 * @param label - The already-resolved name of that metric.
 */
const toRow = (item: MyKpiItem, label: string): LabelledProgressRowData => {
    const target = item.target ?? 0
    const percent = target > 0
        ? Math.min(100, Math.max(0, Math.round((item.current / target) * 100)))
        : 0
    return { id: item.key, title: label, percent, percentText: `${item.current}/${target}` }
}

/**
 * How far off the roll-over is, in whole days and hours.
 *
 * Returns `undefined` when the instant is missing or already past, because "resets in -3 hours" is
 * worse than saying nothing: a week that has already rolled over is one the next request will
 * report differently anyway.
 *
 * @param resetAt - The instant the server sent, or `null`.
 */
const toRemaining = (resetAt: string | null): { days: number, hours: number } | undefined => {
    if (resetAt === null) return undefined
    const at = Date.parse(resetAt)
    if (Number.isNaN(at)) return undefined
    const ms = at - Date.now()
    if (ms <= 0) return undefined
    return { days: Math.floor(ms / 86400000), hours: Math.floor((ms % 86400000) / 3600000) }
}

/**
 * Fetch the week and render it.
 */
export const WeeklyGoals = () => {
    const t = useTranslations("kpi")
    const router = useRouter()
    const kpis = useQueryMyKpisSwr()
    const label = t("heading")
    const editLabel = t("edit")

    const retry = () => {
        void kpis.mutate()
    }
    const edit = () => {
        router.push(KPI_HREF)
    }

    if (kpis.error !== undefined && kpis.error !== null) {
        return (
            <_WeeklyGoals
                state="failed"
                props={{ label, message: t("failed"), retryLabel: t("retry") }}
                on={{ retry }}
            />
        )
    }

    const data = kpis.data
    if (!data && kpis.isLoading === true) {
        return <_WeeklyGoals state="pending" props={{ label }} />
    }

    // A metric with no target is not a target of zero - it is one the reader has not chosen, and
    // a week where none of them is chosen has nothing to be a fraction of.
    const targeted = (data?.items ?? []).filter((item) => item.target !== null && item.target > 0)
    if (targeted.length === 0) {
        // `edit` matters MOST here, not least: this is the state whose whole content is an
        // invitation to set a target, and an invitation with nowhere to go is just a complaint.
        return (
            <_WeeklyGoals
                state="unset"
                props={{ label, editLabel, prompt: t("prompt") }}
                on={{ edit }}
            />
        )
    }

    const composite = data?.composite
    const remaining = toRemaining(data?.resetAt ?? null)

    return (
        <_WeeklyGoals
            state="ready"
            props={{
                label,
                editLabel,
                rows: targeted.map((item) => toRow(item, t(`labels.${item.key}`))),
                summary: t("summary", {
                    percent: composite?.percent ?? 0,
                    completed: composite?.completed ?? 0,
                    total: composite?.total ?? targeted.length,
                }),
                resetLine: remaining === undefined
                    ? undefined
                    : t("resetIn", { days: remaining.days, hours: remaining.hours }),
            }}
            on={{ edit }}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "kpi" } as const

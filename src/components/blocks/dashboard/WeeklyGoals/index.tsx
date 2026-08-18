"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryMyKpisSwr } from "@/hooks"
import { type MyKpiItem } from "@/modules/api/graphql/queries/types/my-kpis"
import { _WeeklyGoals } from "./component"
import type { LabelledProgressRowData } from "@/components/composites/LabelledProgressRow"

/** Stable display order: a weekly board is six known product metrics, never a server-sized list. */
const KPI_ORDER: ReadonlyArray<MyKpiItem["key"]> = [
    "lessons",
    "studyDays",
    "challenges",
    "coding",
    "flashcards",
    "milestones",
]

/** Effective targets used until a learner customises a metric, matching the legacy dashboard. */
const DEFAULT_KPI_TARGETS: Readonly<Record<MyKpiItem["key"], number>> = {
    lessons: 5,
    studyDays: 5,
    challenges: 3,
    coding: 3,
    flashcards: 20,
    milestones: 2,
}

/**
 * BLOCK - `WeeklyGoals`, connected half.
 *
 * It reads ONE request and settles ONE state. Missing custom targets are resolved here to stable
 * product defaults, so the pure half always receives the same six metrics in the same order.
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
 * @param item - One metric of the payload.
 * @param label - The already-resolved name of that metric.
 */
const toRow = (item: MyKpiItem | undefined, key: MyKpiItem["key"], label: string): LabelledProgressRowData & { readonly percent: number } => {
    const target = item?.target ?? DEFAULT_KPI_TARGETS[key]
    const current = item?.current ?? 0
    const percent = target > 0
        ? Math.min(100, Math.max(0, Math.round((current / target) * 100)))
        : 0
    return { id: key, title: label, percent, percentText: `${current}/${target}` }
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
    if (data === undefined) {
        return <_WeeklyGoals state="pending" props={{ label }} />
    }

    const itemByKey = new Map((data?.items ?? []).map((item) => [item.key, item] as const))
    const rows = KPI_ORDER.map((key) => toRow(itemByKey.get(key), key, t(`labels.${key}`)))
    const completed = rows.filter((row) => row.percent >= 100).length
    const progress = KPI_ORDER.reduce((totals, key) => {
        const item = itemByKey.get(key)
        const target = item?.target ?? DEFAULT_KPI_TARGETS[key]
        return {
            current: totals.current + Math.min(item?.current ?? 0, target),
            target: totals.target + target,
        }
    }, { current: 0, target: 0 })
    const percent = progress.target > 0 ? Math.round((progress.current / progress.target) * 100) : 0
    const remaining = toRemaining(data?.resetAt ?? null)

    const summary = t("summary", {
        percent,
        completed,
        total: KPI_ORDER.length,
    })
    const reset = remaining === undefined
        ? undefined
        : t("resetIn", { days: remaining.days, hours: remaining.hours })

    return (
        <_WeeklyGoals
            state="ready"
            props={{
                label,
                editLabel,
                rows,
                summary: reset === undefined ? summary : `${summary} · ${reset}`,
            }}
            on={{ edit }}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "kpi" } as const

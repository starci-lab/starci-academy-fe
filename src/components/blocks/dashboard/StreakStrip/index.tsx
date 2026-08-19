"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryMyWeeklyStatsSwr } from "@/hooks"
import { type MyWeeklyStatsDay } from "@/modules/api/graphql/queries/types/my-weekly-stats"
import { StreakStripBase } from "./component"
import type { DayCellData } from "@/components/leaves/DayCell"

/**
 * BLOCK - `StreakStrip`, connected half.
 *
 * It reads ONE request and settles ONE state. That is the whole rule: a block that read three
 * would either hold two finished regions hostage to a slow third, or need three flags nothing
 * downstream could reconcile.
 *
 * DATE FORMATTING LIVES HERE for the same reason the request does: both depend on who is looking,
 * and a component that renders already-resolved text can be mounted from a test without either.
 */

/**
 * The locale the dates are formatted in. Fixed here on purpose: locale resolution is the
 * translation tier's decision, and picking it up from the runtime would make one build render
 * different text on two machines.
 */
const DATE_LOCALE = "en-US"

/** Weekday letter under each dot. */
const WEEKDAY_FORMAT = new Intl.DateTimeFormat(DATE_LOCALE, { weekday: "narrow", timeZone: "UTC" })

/** Full date, read out by assistive technology. */
const DATE_FORMAT = new Intl.DateTimeFormat(DATE_LOCALE, { dateStyle: "medium", timeZone: "UTC" })

/**
 * Keep the settled zero-activity state shaped like a real week even if an incomplete payload omits
 * its day array. The backend normally supplies these seven dates; this fallback protects the visual
 * contract instead of turning missing optional content into a different tree.
 */
const emptyWeek = (): ReadonlyArray<DayCellData> => {
    const today = new Date()
    return Array.from({ length: 7 }, (_unused, index) => {
        const date = new Date(today)
        date.setUTCDate(today.getUTCDate() - (6 - index))
        const isoDate = date.toISOString().slice(0, 10)
        return {
            id: isoDate,
            active: false,
            weekday: WEEKDAY_FORMAT.format(date),
            title: DATE_FORMAT.format(date),
        }
    })
}

/**
 * Resolve one payload day into a rendered column.
 *
 * @param day - One day of the payload.
 */
const toStripDay = (day: MyWeeklyStatsDay): DayCellData => {
    const date = new Date(`${day.date}T00:00:00Z`)
    return {
        id: day.date,
        active: day.active,
        weekday: WEEKDAY_FORMAT.format(date),
        title: DATE_FORMAT.format(date),
    }
}

/**
 * Fetch the week and render the strip.
 */
export const StreakStrip = () => {
    const t = useTranslations("streak")
    const router = useRouter()
    const weekly = useQueryMyWeeklyStatsSwr()
    const stats = weekly.data
    const label = t("heading")

    // A FAILURE outranks a retry that reports itself as loading: SWR retries a rejected key on a
    // backoff and says `isLoading` on every attempt, so a strip reading the flag alone would
    // shimmer for as long as the backend was unreachable.
    if (weekly.error !== undefined && weekly.error !== null) {
        return (
            <StreakStripBase
                state="failed"
                props={{ label, message: t("failed"), retryLabel: t("retry") }}
                on={{ retry: () => void weekly.mutate() }}
            />
        )
    }

    const onLearn = () => router.push("/courses")
    if (stats === undefined) {
        return (
            <StreakStripBase
                state="pending"
                props={{ label, message: t("empty"), actionLabel: t("action") }}
                on={{ learn: onLearn }}
            />
        )
    }

    const days = stats?.days.map(toStripDay) ?? emptyWeek()
    const streak = stats?.streak ?? 0

    return (
        <StreakStripBase
            state="ready"
            props={{
                label,
                streak,
                record: t("longest", { count: stats?.longestStreak ?? 0 }),
                days,
                current: t("current", { count: streak }),
                emptyMessage: t("empty"),
                actionLabel: t("action"),
                nudge: t("nudge"),
            }}
            on={{ learn: onLearn }}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "streak" } as const

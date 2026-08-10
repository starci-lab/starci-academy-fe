"use client"

import { useTranslations } from "next-intl"
import { useQueryMyWeeklyStatsSwr } from "@/hooks"
import { type MyWeeklyStatsDay } from "@/modules/api/graphql/queries/types/my-weekly-stats"
import { _StreakStrip } from "./component"
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
    const weekly = useQueryMyWeeklyStatsSwr()
    const stats = weekly.data
    const label = t("heading")

    // A FAILURE outranks a retry that reports itself as loading: SWR retries a rejected key on a
    // backoff and says `isLoading` on every attempt, so a strip reading the flag alone would
    // shimmer for as long as the backend was unreachable.
    if (weekly.error !== undefined && weekly.error !== null) {
        return (
            <_StreakStrip
                state="failed"
                props={{ label, message: t("failed"), retryLabel: t("retry") }}
                on={{ retry: () => void weekly.mutate() }}
            />
        )
    }

    const readoutLabel = t("currentLabel")
    if (!stats && weekly.isLoading === true) {
        return <_StreakStrip state="pending" props={{ label, readout: { label: readoutLabel } }} />
    }

    const days = (stats?.days ?? []).map(toStripDay)
    const streak = stats?.streak ?? 0
    if (!stats || (streak === 0 && !days.some((day) => day.active === true))) {
        return <_StreakStrip state="empty" props={{ label, message: t("empty") }} />
    }

    return (
        <_StreakStrip
            state="ready"
            props={{
                label,
                record: t("longest", { count: stats.longestStreak ?? 0 }),
                days,
                readout: { label: readoutLabel, value: t("current", { count: streak }) },
            }}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "streak" } as const

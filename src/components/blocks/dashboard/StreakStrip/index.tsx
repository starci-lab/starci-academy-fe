"use client"

import { useQueryMyWeeklyStatsSwr } from "@/hooks"
import { type MyWeeklyStatsDay } from "@/modules/api/graphql/queries/types/my-weekly-stats"
import {
    _StreakStrip,
    type StreakStripDay,
    type StreakStripLabels,
} from "./component"

/**
 * BLOCK - `StreakStrip`, connected half.
 *
 * Reads the weekly-stats request and resolves it into strings. Date formatting lives
 * here rather than in the presentational half for the same reason the request does:
 * both depend on who is looking, and a component that renders already-resolved text
 * can be rendered from a test or a story without either of them.
 */

/*
 * The payload shape is NOT restated here. This file used to declare its own `WeeklyStatsLeaf`
 * and `WeeklyStatsSlice` and then double-cast the hook onto them, so the query could rename
 * `longestStreak` and this block would keep compiling and render a zero it invented. It now
 * reads the hook's own return type, and `MyWeeklyStatsDay` - the type the query publishes -
 * for the one function that takes a day apart.
 */

/**
 * The locale the dates are formatted in. Fixed here on purpose: locale resolution is
 * the translation tier's decision, and picking it up from the runtime instead would
 * make the same build render different text on two machines.
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
const toStripDay = (day: MyWeeklyStatsDay): StreakStripDay => {
    const date = new Date(`${day.date}T00:00:00Z`)
    return {
        date: day.date,
        active: day.active,
        weekday: WEEKDAY_FORMAT.format(date),
        title: DATE_FORMAT.format(date),
    }
}

/**
 * Resolve the copy for a settled payload.
 *
 * @param streak - Current streak length, in days.
 * @param longest - Longest streak ever reached, in days.
 */
const toLabels = (streak: number, longest: number): StreakStripLabels => ({
    heading: "Learning streak",
    loading: "Loading",
    empty: "No streak yet",
    currentLabel: "Current streak",
    current: streak === 1 ? "1 day" : `${streak} days`,
    longest: `Longest ${longest} days`,
})

/**
 * Fetch the week and render the strip.
 */
export const StreakStrip = () => {
    const weekly = useQueryMyWeeklyStatsSwr()
    const stats = weekly.data

    // Rests only on a FIRST load, and never once the request has FAILED: SWR retries a rejected
    // key on a backoff and reports `isLoading` again on every attempt, so a strip that read the
    // flag alone would shimmer for as long as the backend was unreachable.
    const hasFailed = weekly.error !== undefined && weekly.error !== null
    const isLoading = !stats && !hasFailed && weekly.isLoading === true
    const days = (stats?.days ?? []).map(toStripDay)
    const isEmpty = hasFailed || !stats || ((stats.streak ?? 0) === 0 && !days.some((day) => day.active))

    return (
        <_StreakStrip
            isLoading={isLoading}
            isEmpty={isEmpty}
            days={days}
            labels={toLabels(stats?.streak ?? 0, stats?.longestStreak ?? 0)}
        />
    )
}

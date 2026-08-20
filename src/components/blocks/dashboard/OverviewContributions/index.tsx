"use client"

import { useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useQueryMyContributionCalendarSwr } from "@/hooks"
import { OverviewContributionsBase } from "./component"

const longestRun = (dates: ReadonlyArray<string>) => {
    const active = new Set(dates)
    let longest = 0
    let current = 0
    const ordered = [...dates].sort((left, right) => left.localeCompare(right))
    for (const iso of ordered) {
        const before = new Date(`${iso}T00:00:00Z`)
        before.setUTCDate(before.getUTCDate() - 1)
        current = active.has(before.toISOString().slice(0, 10)) ? current + 1 : 1
        longest = Math.max(longest, current)
    }
    return longest
}

/** Connected half: owns the selected calendar year and resolves locale labels. */
export const OverviewContributions = () => {
    const t = useTranslations("contributions")
    const locale = useLocale()
    const [year, setYear] = useState(() => new Date().getFullYear())
    const years = useMemo(() => {
        const current = new Date().getFullYear()
        return [current, current - 1, current - 2]
    }, [])
    const calendar = useQueryMyContributionCalendarSwr(year)
    const days = calendar.data ?? []
    const labels = useMemo(() => ({
        months: Array.from({ length: 12 }, (_unused, month) => new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(Date.UTC(year, month, 1)))),
        weekdays: Array.from({ length: 7 }, (_unused, day) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(Date.UTC(2024, 0, day + 7)))),
    }), [locale, year])
    const total = days.reduce((sum, day) => sum + day.total, 0)
    const state = calendar.error !== undefined && calendar.data === undefined
        ? "failed"
        : calendar.data === undefined
            ? "pending"
            : days.length === 0
                ? "empty"
                : "ready"

    return (
        <OverviewContributionsBase
            state={state}
            props={{
                label: t("title"),
                year,
                years,
                yearLabel: t("year", { count: total, year }),
                streakLabel: t("streak", { count: longestRun(days.filter((day) => day.total > 0).map((day) => day.date)) }),
                lessLabel: t("less"),
                moreLabel: t("more"),
                emptyMessage: t("empty", { year }),
                errorMessage: t("failed"),
                monthLabels: labels.months,
                weekdayLabels: labels.weekdays,
                days: days.map((day) => ({ date: day.date, count: day.total, label: `${day.date}: ${day.total}` })),
            }}
            on={{ selectYear: setYear }}
        />
    )
}

export * from "./component"

/** Source-level tier marker for the connected dashboard block. */
export const meta = { world: "connected", domain: "dashboard" } as const

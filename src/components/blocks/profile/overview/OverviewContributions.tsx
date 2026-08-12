"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { ContributionCalendar } from "@/components/composites/ContributionCalendar"
import { defineCompositeComponent, defineContractComponent } from "@/components/contracts/props"
import { useOverviewEvidence } from "./useOverviewEvidence"
import { usePublicWeeklyStats } from "./usePublicWeeklyStats"

type Day = { readonly date: string, readonly total: number, readonly contents: number, readonly challenges: number, readonly milestones: number }
/** Legacy contribution evidence is a year heatmap plus current/longest streak, never a list of dates. */
export const OverviewContributions = () => {
    const t = useTranslations()
    const [year, setYear] = useState(() => new Date().getFullYear())
    const calendar = useOverviewEvidence<ReadonlyArray<Day>>("contributions", { year })
    const weekly = usePublicWeeklyStats()
    const days = calendar.data ?? []
    const total = days.reduce((sum, day) => sum + day.total, 0)
    const currentYear = new Date().getFullYear()
    return <SurfaceCard props={{ label: t("profile.evidence.contributions.label") }} contract="contribution-calendar-card" render={defineContractComponent("contribution-calendar-card", {
        calendar: defineCompositeComponent("contribution-calendar", {}, () => <ContributionCalendar
            isLoading={calendar.isLoading}
            props={{
                year,
                years: [currentYear, currentYear - 1],
                totalLabel: calendar.error ? t("profile.evidence.error") : t("contributions.year", { count: total, year }),
                streakLabel: weekly.error ? undefined : t("profile.overview.streak", { current: weekly.data?.streak ?? 0, longest: weekly.data?.longestStreak ?? 0 }),
                lessLabel: t("contributions.less"),
                moreLabel: t("contributions.more"),
                days: days.map((day) => ({ date: day.date, count: day.total, label: `${day.date}: ${day.total}` })),
            }}
            on={{ selectYear: setYear }}
        />),
    })} />
}

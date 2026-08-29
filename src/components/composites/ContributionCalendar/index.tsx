import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { ContributionGrid } from "@/components/leaves/ContributionGrid"
import { ContributionIntensityLegend } from "@/components/leaves/ContributionIntensityLegend"
import { Text } from "@/components/leaves/Text"
import { contributionCalendarClassName, contributionCalendarRowClassName } from "./classNames"

/** One contribution day with an accessible, already-resolved description. */
export type ContributionCalendarDay = {
    readonly date: string
    readonly count: number
    readonly label: string
}

/** Resolved labels and values for one yearly activity calendar. */
export type ContributionCalendarData = {
    readonly year: number
    readonly years: ReadonlyArray<number>
    readonly totalLabel?: string
    readonly streakLabel?: string
    readonly lessLabel?: string
    readonly moreLabel?: string
    readonly monthLabels?: ReadonlyArray<string>
    readonly weekdayLabels?: ReadonlyArray<string>
    readonly days?: ReadonlyArray<ContributionCalendarDay>
}

/** What changing the contribution year reports. */
export type ContributionCalendarActions = {
    readonly selectYear?: (year: number) => void
}

/** Props for the closed contribution-calendar composition. */
export type ContributionCalendarProps = { readonly props: ContributionCalendarData; readonly on?: ContributionCalendarActions; readonly isLoading?: boolean }

/** Draw the fixed year summary, intrinsic plot and its reading key. */
export const ContributionCalendar = (props: ContributionCalendarProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    return <div className={contributionCalendarClassName}>
        <div className={contributionCalendarRowClassName}><Text props={{ content: data.totalLabel, size: "xs", tone: "muted" }} isLoading={isLoading} /><ChoiceTabs
            props={{
                label: data.totalLabel ?? "",
                selectedKey: String(data.year),
                variant: "primary",
                tabs: data.years.map((year) => ({ id: String(year), label: String(year) })),
            }}
            on={{ select: (key) => on?.selectYear?.(Number(key)) }}
        /></div>
        <ContributionGrid
            props={{
                year: data.year,
                monthLabels: data.monthLabels ?? [],
                weekdayLabels: data.weekdayLabels ?? [],
                days: data.days ?? [],
            }}
            isLoading={isLoading}
        />
        <div className={contributionCalendarRowClassName}><Text props={{ content: data.streakLabel, size: "sm" }} isLoading={isLoading} /><ContributionIntensityLegend
            props={{ lessLabel: data.lessLabel, moreLabel: data.moreLabel }}
            isLoading={isLoading}
        /></div>
    </div>
}

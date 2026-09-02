import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { ContributionGrid } from "@/components/leaves/ContributionGrid"
import { ContributionIntensityLegend } from "@/components/leaves/ContributionIntensityLegend"
import { Text } from "@starci/grammar/common"
import {
    contributionCalendarClassName,
    contributionCalendarFlushClassName,
    contributionCalendarFooterBandClassName,
    contributionCalendarGridBandClassName,
    contributionCalendarHeaderBandClassName,
    contributionCalendarRowClassName,
    contributionCalendarSeparatorClassName,
} from "./classNames"

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
export type ContributionCalendarProps = {
    readonly props: ContributionCalendarData
    readonly on?: ContributionCalendarActions
    readonly isLoading?: boolean
    /** Lay out as full-bleed dashboard bands with separators instead of a padded stack. */
    readonly isFlush?: boolean
}

/** Resolved year-selector data inside the calendar composition. */
type YearSelectorProps = {
    readonly totalLabel?: string
    readonly year: number
    readonly years: ReadonlyArray<number>
    readonly selectYear?: (year: number) => void
}

const YearSelector = (props: YearSelectorProps) => (
    <ChoiceTabs
        props={{
            label: props.totalLabel ?? "",
            selectedKey: String(props.year),
            variant: "primary",
            tabs: props.years.map((year) => ({ id: String(year), label: String(year) })),
        }}
        on={{ select: (key) => props.selectYear?.(Number(key)) }}
    />
)

/** Draw the fixed year summary, intrinsic plot and its reading key. */
export const ContributionCalendar = (props: ContributionCalendarProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    const isFlush = props.isFlush ?? false

    if (isFlush) {
        return (
            <div className={contributionCalendarFlushClassName} data-part="contribution-calendar">
                <div className={contributionCalendarHeaderBandClassName} data-part="contribution-header">
                    <Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{data.totalLabel}</Text>
                    <YearSelector
                        totalLabel={data.totalLabel}
                        year={data.year}
                        years={data.years}
                        selectYear={on?.selectYear}
                    />
                </div>
                <div aria-hidden className={contributionCalendarSeparatorClassName} />
                <div className={contributionCalendarGridBandClassName} data-part="contribution-grid">
                    <ContributionGrid
                        props={{
                            year: data.year,
                            monthLabels: data.monthLabels ?? [],
                            weekdayLabels: data.weekdayLabels ?? [],
                            days: data.days ?? [],
                        }}
                        isLoading={isLoading}
                    />
                </div>
                <div aria-hidden className={contributionCalendarSeparatorClassName} />
                <div className={contributionCalendarFooterBandClassName} data-part="contribution-footer">
                    <Text size={"sm"} isSkeleton={isLoading}>{data.streakLabel}</Text>
                    <ContributionIntensityLegend
                        props={{ lessLabel: data.lessLabel, moreLabel: data.moreLabel }}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className={contributionCalendarClassName} data-part="contribution-calendar">
            <div className={contributionCalendarRowClassName}>
                <Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{data.totalLabel}</Text>
                <YearSelector
                    totalLabel={data.totalLabel}
                    year={data.year}
                    years={data.years}
                    selectYear={on?.selectYear}
                />
            </div>
            <ContributionGrid
                props={{
                    year: data.year,
                    monthLabels: data.monthLabels ?? [],
                    weekdayLabels: data.weekdayLabels ?? [],
                    days: data.days ?? [],
                }}
                isLoading={isLoading}
            />
            <div className={contributionCalendarRowClassName}>
                <Text size={"sm"} isSkeleton={isLoading}>{data.streakLabel}</Text>
                <ContributionIntensityLegend
                    props={{ lessLabel: data.lessLabel, moreLabel: data.moreLabel }}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}

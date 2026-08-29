import { DashboardSurfaceCard as SurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import {
    ContributionCalendar,
    type ContributionCalendarDay,
} from "@/components/composites/ContributionCalendar"

/** One calendar day with its already-resolved accessible label. */
export type ContributionDay = ContributionCalendarDay

/** Resolved yearly activity and streak copy drawn by the block. */
export type OverviewContributionsData = {
    readonly label: string
    readonly year: number
    readonly years: ReadonlyArray<number>
    readonly yearLabel: string
    readonly streakLabel: string
    readonly lessLabel: string
    readonly moreLabel: string
    readonly emptyMessage: string
    readonly errorMessage: string
    readonly monthLabels?: ReadonlyArray<string>
    readonly weekdayLabels?: ReadonlyArray<string>
    readonly days?: ReadonlyArray<ContributionDay>
}

/** Product decisions reported by the pure contribution block. */
export type OverviewContributionsActions = {
    readonly selectYear?: (year: number) => void
}

/** State and data accepted by the pure contribution block. */
export type OverviewContributionsProps = {
    readonly state: "pending" | "empty" | "failed" | "ready"
    readonly props: OverviewContributionsData
    readonly on?: OverviewContributionsActions
}

/** Draw the complete contribution calendar without owning its query or selected-year state. */
export const OverviewContributionsBase = (props: OverviewContributionsProps) => {
    const isLoading = props.state === "pending"
    const totalLabel = props.state === "failed"
        ? props.props.errorMessage
        : props.state === "empty" ? props.props.emptyMessage : props.props.yearLabel

    return (
        <SurfaceCard props={{ label: props.props.label }} isLoading={isLoading}>
            <ContributionCalendar
                props={{
                    year: props.props.year,
                    years: props.props.years,
                    totalLabel,
                    streakLabel: props.props.streakLabel,
                    lessLabel: props.props.lessLabel,
                    moreLabel: props.props.moreLabel,
                    monthLabels: props.props.monthLabels,
                    weekdayLabels: props.props.weekdayLabels,
                    days: props.state === "ready" ? props.props.days : [],
                }}
                on={{ selectYear: props.on?.selectYear }}
                isLoading={isLoading}
            />
        </SurfaceCard>
    )
}

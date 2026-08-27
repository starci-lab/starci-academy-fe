"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { contributionGridClassName, contributionMonthClassName, contributionViewportClassName, contributionWeekClassName, contributionWeekdayClassName, contributionWeekdayColumnClassName, getContributionCellClassName } from "./classNames"

/** One contribution day with its already-resolved accessible description. */
export type ContributionGridDay = {
    readonly date: string
    readonly count: number
    readonly label: string
}

/** The values needed by one intrinsic yearly contribution plot. */
export type ContributionGridData = {
    readonly year: number
    readonly monthLabels: ReadonlyArray<string>
    readonly weekdayLabels: ReadonlyArray<string>
    readonly days: ReadonlyArray<ContributionGridDay>
}

/** Props for the intrinsic contribution plot. */
export type ContributionGridProps = { readonly props: ContributionGridData; readonly isLoading?: boolean }

type CalendarCell = ContributionGridDay & { readonly inYear: boolean }
type CalendarWeek = { readonly id: string; readonly monthLabel?: string; readonly cells: ReadonlyArray<CalendarCell> }

const levelOf = (count: number) => count <= 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4

const makeWeeks = (
    year: number,
    days: ReadonlyArray<ContributionGridDay>,
    monthLabels: ReadonlyArray<string>,
): ReadonlyArray<CalendarWeek> => {
    const byDate = new Map(days.map((day) => [day.date, day]))
    const first = new Date(Date.UTC(year, 0, 1))
    const cursor = new Date(first)
    cursor.setUTCDate(first.getUTCDate() - first.getUTCDay())
    const last = new Date(Date.UTC(year, 11, 31))
    const weeks: Array<CalendarWeek> = []
    let previousMonth = -1

    while (cursor <= last) {
        const cells: Array<CalendarCell> = []
        let monthLabel: string | undefined
        for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
            const date = cursor.toISOString().slice(0, 10)
            const inYear = cursor.getUTCFullYear() === year
            const source = byDate.get(date)
            if (inYear && cursor.getUTCMonth() !== previousMonth) {
                previousMonth = cursor.getUTCMonth()
                monthLabel = monthLabels[previousMonth]
            }
            cells.push({ date, count: source?.count ?? 0, label: source?.label ?? date, inYear })
            cursor.setUTCDate(cursor.getUTCDate() + 1)
        }
        // The inner loop runs seven times unconditionally, so a week always opens on a dated cell.
        weeks.push({ id: cells[0].date, monthLabel, cells })
    }
    return weeks
}

/** Draw the draggable, accessible contribution grid as one intrinsic visualization. */
export const ContributionGrid = (props: ContributionGridProps) => {
    const isLoading = props.isLoading === true
    const viewportRef = useRef<HTMLDivElement>(null)
    const weeks = makeWeeks(props.props.year, props.props.days, props.props.monthLabels)

    return (
        <div ref={viewportRef} className={contributionViewportClassName} data-part="calendar-viewport">
            <motion.div
                drag="x"
                dragConstraints={viewportRef}
                dragElastic={0.04}
                dragMomentum={false}
                className={contributionGridClassName}
                data-part="calendar-grid"
            >
                <span className={contributionWeekdayColumnClassName} aria-hidden="true">
                    {props.props.weekdayLabels.map((label) => (
                        <span key={label} className={contributionWeekdayClassName}>{label}</span>
                    ))}
                </span>
                {weeks.map((week) => (
                    <span key={week.id} className={contributionWeekClassName} data-part="calendar-week">
                        <span className={contributionMonthClassName} aria-hidden="true">{week.monthLabel ?? ""}</span>
                        {week.cells.map((cell) => (
                            <span
                                key={cell.date}
                                data-part="calendar-day"
                                data-date={cell.date}
                                data-count={cell.count}
                                aria-label={cell.inYear ? cell.label : undefined}
                                aria-hidden={cell.inYear ? undefined : true}
                                className={getContributionCellClassName(levelOf(cell.count), isLoading, cell.inYear)}
                            />
                        ))}
                    </span>
                ))}
            </motion.div>
        </div>
    )
}

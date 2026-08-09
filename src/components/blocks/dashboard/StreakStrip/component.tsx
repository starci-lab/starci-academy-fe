import { Badge } from "@/components/atoms/Badge"
import { DayCell } from "@/components/atoms/DayCell"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import { IconLabelValueRow } from "@/components/composites/lists/IconLabelValueRow"
import { SurfaceCard } from "@/components/composites/cards/SurfaceCard"
import type { DashboardSectionChain, ContractSlotProps } from "@/components/contracts"

/**
 * BLOCK - `StreakStrip`, presentational half.
 *
 * The last seven days as a run of columns, beside the readout they add up to.
 *
 * WHAT IS LEFT HERE AFTER THE PORT. `SurfaceCard` owns the bounded region and the title line
 * with the record on its baseline; `IconLabelValueRow` owns the readout, which is the same spec
 * line the identity rail draws three of - the same shape for the same kind of fact, rather than
 * a second one that has to be kept in step. What remains is this block's own business: that a
 * week is SEVEN columns whatever the payload says, and that the readout supports the run rather
 * than competing with it.
 *
 * `split` is the right key for that last part for the reason the key itself states: the aside
 * drops underneath at a narrow width instead of halving the room the days need. `track` draws
 * the run, and owns the list element, so the seven columns are announced as seven.
 *
 * The resting state is the same tree with the same seven columns, never a second one. A
 * hand-kept resting copy is only ever noticed after it has already drifted.
 */

/** How many day columns the strip draws - the last seven days, always seven. */
const DAY_COUNT = 7

/** One day of the strip, already resolved by the connected half. */
export interface StreakStripDay {
    /** ISO date. Used as the column key. */
    date: string
    /** Whether the learner was active that day. */
    active: boolean
    /** Already-localized narrow weekday label under the dot. */
    weekday: string
    /** Already-localized full date, read out by assistive technology. */
    title: string
}

/** Every string this block renders, already resolved by the connected half. */
export interface StreakStripLabels {
    /** Heading over the strip. */
    heading: string
    /** Stands in for the readout while the request is in flight. */
    loading: string
    /** Read when the learner has no streak to show yet. */
    empty: string
    /** Names the figure beside it - the label of the readout, never the figure itself. */
    currentLabel: string
    /** Current-streak figure, already interpolated. */
    current: string
    /** Longest-streak sentence, already interpolated - a record, so it sits by the heading. */
    longest: string
}

/** Props for {@link _StreakStrip} - presentational; no fetch, no store, no i18n. */
export interface StreakStripProps {
    /**
     * First load with nothing in hand - the strip rests as itself. SWR's `isLoading` and not
     * `isValidating`: a refetch happens with the week already on screen, and resting on it would
     * blank a strip the reader is reading. See {@link ContractSlotProps.isLoading}.
     */
    isLoading?: boolean
    /** Settled with no activity to show - including settled by failing. Never the flag above. */
    isEmpty?: boolean
    /** The last seven days, oldest first. */
    days?: ReadonlyArray<StreakStripDay>
    /** Resolved copy. */
    labels: StreakStripLabels
}

/** Placeholder columns, kept at the real count so the resting shape is the loaded one. */
const RESTING_DAYS: ReadonlyArray<number> = Array.from({ length: DAY_COUNT }, (_unused, index) => index)

/**
 * Render the strip.
 *
 * @param props - {@link StreakStripProps}
 */
export const _StreakStrip = ({
    isLoading = false,
    isEmpty = false,
    days = [],
    labels,
}: StreakStripProps) => {
    /** The `body` role of the `track` key: the seven columns themselves. */
    const Days = ({ isLoading: resting }: ContractSlotProps) => (
        <>
            {resting === true
                ? RESTING_DAYS.map((index) => (
                    <DayCell key={index} weekday="" label={labels.loading} isLoading />
                ))
                : days.map((day) => (
                    <DayCell
                        key={day.date}
                        weekday={day.weekday}
                        label={day.title}
                        isActive={day.active}
                    />
                ))}
        </>
    )

    /** The `body` role of the `split` key: the week as a run of columns. */
    const DayList = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree contract="track" isLoading={resting} slots={{ body: Days }} />
    )

    /**
     * The figure the seven days add up to.
     *
     * A badge rather than a sentence because it is the one number this block exists to produce -
     * and a settled zero is a fact rather than a wait, so it keeps its words and drops the
     * accent instead of shimmering forever.
     */
    const ReadoutValue = () => {
        if (isLoading) return <Text size="sm" isLoading>{labels.loading}</Text>
        if (isEmpty) return <Text tone="muted" size="sm">{labels.empty}</Text>
        return <Badge tone="accent">{labels.current}</Badge>
    }

    /** The `aside` role of the `split` key: the same spec line the identity rail draws. */
    const Readout = () => (
        <IconLabelValueRow
            icon="streak"
            label={labels.currentLabel}
            value={labels.current}
            valueSlot={ReadoutValue}
            isLoading={isLoading}
        />
    )

    /** The `body` role of the surface: the week, with what it adds up to beside it. */
    const Body = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree contract="split" isLoading={resting} slots={{ body: DayList, aside: Readout }} />
    )

    return (
        <SurfaceCard
            label={labels.heading}
            meta={isLoading ? labels.loading : labels.longest}
            body={Body}
            isLoading={isLoading}
        />
    )
}

/**
 * This block's entry in the dashboard chain: it IS the body of the region named `streak-strip`.
 *
 * The keys fix the shape - a bounded surface over two halves that stack when narrow - and none
 * of them can say that the left half is a WEEK. This entry says it, and the compiler holds it:
 * `StreakStripProps` is the only props type in the chain taking a `days` list, so a block that
 * does not model seven columns cannot fill this region.
 */
export const streakStripChain: DashboardSectionChain = {
    name: "streak-strip",
    body: _StreakStrip,
}

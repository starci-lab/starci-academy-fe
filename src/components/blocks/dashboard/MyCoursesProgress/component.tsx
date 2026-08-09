import { Button } from "@/components/atoms/Button"
import { Tree } from "@/components/frames/Tree"
import { CourseProgressBar } from "@/components/composites/stats/CourseProgressBar"
import { EmptyState } from "@/components/composites/feedback/EmptyState"
import { SurfaceCard } from "@/components/composites/cards/SurfaceCard"
import type { DashboardSectionChain, ContractSlotProps } from "@/components/contracts"

/**
 * BLOCK - `MyCoursesProgress`, presentational half.
 *
 * The courses the learner is enrolled in, each with how far through it they are.
 *
 * WHAT IS LEFT HERE AFTER THE PORT. Three composites now carry what this file used to spell out:
 * `SurfaceCard` owns the bounded region and its title line with the count on the baseline,
 * `CourseProgressBar` owns one course, and `EmptyState` owns the settled nothing and the way out
 * of it. What remains is this block's own business: that a course list is a GRID of peer cards -
 * they are compared with each other rather than read in order - and that a resting list draws
 * the same cards at a fixed count.
 *
 * THE ORDER OF THE THREE STATES IS NOT A COMPONENT. Resting is read first and empty second, and
 * that is written here as two lines rather than routed through a wrapper: the frame already
 * threads the resting flag to every slot from one place, so a component whose whole job was to
 * choose between the states would be a second description of a decision the spine already makes.
 *
 * The resting state is this same tree with placeholder cards, never a second tree.
 */

/** How many placeholder cards the resting list draws. */
const RESTING_ROW_COUNT = 2

/** One already-resolved course row. */
export interface MyCoursesProgressCourse {
    /** Stable id of the course. Used as the card key. */
    id: string
    /** Course title. */
    title: string
    /** Overall completion, 0 to 100 - the value of the progress element. */
    percent: number
    /** Already-formatted completion readout. */
    percentText: string
}

/** Every string this block renders, already resolved by the connected half. */
export interface MyCoursesProgressLabels {
    /** Heading over the list. */
    heading: string
    /** Course count, already interpolated - sits on the heading's baseline. */
    count: string
    /** Stands in for the count and the cards while the request is in flight. */
    loading: string
    /** Read once the request settles with no enrolled courses. */
    empty: string
    /** The label of the way out of the empty state. */
    retry: string
}

/** Props for {@link _MyCoursesProgress} - presentational; no fetch, no store, no i18n. */
export interface MyCoursesProgressProps {
    /**
     * First load with nothing in hand - the list rests as itself. SWR's `isLoading` and not
     * `isValidating`: a refetch happens with the courses already on screen, and resting on it
     * would blank a list the reader is reading. See {@link ContractSlotProps.isLoading}.
     */
    isLoading?: boolean
    /** Settled with no enrolled courses - including settled by failing. Never the flag above. */
    isEmpty?: boolean
    /** The enrolled courses, in display order. */
    courses?: ReadonlyArray<MyCoursesProgressCourse>
    /** Resolved copy. */
    labels: MyCoursesProgressLabels
    /**
     * Asks for the list again, from the empty state.
     *
     * An empty region still has to offer a way out, and this is the honest one: a learner who
     * has enrolled in nothing is looking at the same screen as a learner whose backend answered
     * before its data was there, and only asking again tells them apart. The connected half
     * always passes it; it is optional so a story can draw the state without a handler.
     */
    onRetry?: () => void
}

/** Placeholder cards, drawn at a fixed count so the resting shape is the loaded one. */
const RESTING_ROWS: ReadonlyArray<number> = Array.from({ length: RESTING_ROW_COUNT }, (_unused, index) => index)

/**
 * Render the course list.
 *
 * @param props - {@link MyCoursesProgressProps}
 */
export const _MyCoursesProgress = ({
    isLoading = false,
    isEmpty = false,
    courses = [],
    labels,
    onRetry,
}: MyCoursesProgressProps) => {
    /** The `action` role of the empty state: the way out the key insists on. */
    const Retry = () => (
        <Button variant="secondary" icon="retry" onClick={onRetry}>
            {labels.retry}
        </Button>
    )

    /** What the region says once it has settled with nothing to show. */
    const Empty = () => <EmptyState icon="course" title={labels.empty} action={Retry} />

    /**
     * The `body` role of the `grid` key: the cards themselves, resting or real.
     *
     * A resting card is the SAME card at the same count, so the grid does not reflow when the
     * courses land - which is the whole reason the placeholder count is fixed rather than
     * guessed from a list that is not there yet.
     */
    const Cards = ({ isLoading: resting }: ContractSlotProps) => {
        if (resting === true) {
            return (
                <>
                    {RESTING_ROWS.map((index) => (
                        <CourseProgressBar
                            key={index}
                            title={labels.loading}
                            percent={0}
                            percentText=""
                            isLoading
                        />
                    ))}
                </>
            )
        }
        return (
            <>
                {courses.map((course) => (
                    <CourseProgressBar
                        key={course.id}
                        title={course.title}
                        percent={course.percent}
                        percentText={course.percentText}
                    />
                ))}
            </>
        )
    }

    /**
     * The `body` role of the surface: whichever of the three shapes this region is in.
     *
     * Resting is read BEFORE empty, always. A first load has nothing in hand, so a list is
     * momentarily empty for a reason that is not an answer - and read the other way round, an
     * enrolled learner is shown the message that says they have enrolled in nothing.
     */
    const Body = ({ isLoading: resting }: ContractSlotProps) => {
        if (resting !== true && isEmpty) return <Empty />
        return <Tree contract="grid" isLoading={resting} slots={{ body: Cards }} />
    }

    return (
        <SurfaceCard
            label={labels.heading}
            meta={isLoading ? labels.loading : labels.count}
            body={Body}
            isLoading={isLoading}
        />
    )
}

/**
 * This block's entry in the dashboard chain: it IS the body of the region named
 * `courses-progress`.
 *
 * The keys fix the shape - a bounded surface with a count on the title's baseline, over a grid -
 * and say nothing about what the grid holds. This entry says it, and says it in code the
 * compiler checks: `MyCoursesProgressProps` is the only props type in the chain carrying both a
 * `courses` list and a resolved count label, so a block without both cannot claim this name.
 */
export const myCoursesProgressChain: DashboardSectionChain = {
    name: "courses-progress",
    body: _MyCoursesProgress,
}

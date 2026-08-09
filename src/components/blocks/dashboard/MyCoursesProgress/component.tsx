import { Tree } from "@/components/frames/Tree"
import type { TreeSlotProps, TreeSlots } from "@/components/classNames"

/**
 * BLOCK - `MyCoursesProgress`, presentational half.
 *
 * The courses the learner is enrolled in, each with how far through it they are.
 *
 * Three registry keys, each for the reason the key itself states. `section-header`
 * puts the course COUNT on the heading's baseline, because the count reads as part of
 * the heading sentence rather than as a second line. `section` seams the heading off
 * from the list below it. `stat` holds one course, because the title is read before
 * the figure and must never share its line - a long course title on a narrow column
 * would otherwise wrap between the number and its unit.
 *
 * The resting state is this same tree with placeholder rows, never a second tree.
 */

/** How many placeholder rows the resting list draws. */
const RESTING_ROW_COUNT = 2

/** One already-resolved course row. */
export interface MyCoursesProgressCourse {
    /** Stable id of the course. Used as the row key. */
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
    /** Stands in for the count and the rows while the request is in flight. */
    loading: string
    /** Read once the request settles with no enrolled courses. */
    empty: string
}

/** Props for {@link _MyCoursesProgress} - presentational; no fetch, no store, no i18n. */
export interface MyCoursesProgressProps {
    /** First load with nothing in hand - the list rests as itself. */
    isSkeleton?: boolean
    /** Settled with no enrolled courses. */
    isEmpty?: boolean
    /** The enrolled courses, in display order. */
    courses?: readonly MyCoursesProgressCourse[]
    /** Resolved copy. */
    labels: MyCoursesProgressLabels
}

/** Placeholder rows, drawn at a fixed count so the resting shape is the loaded one. */
const RESTING_ROWS: readonly number[] = Array.from({ length: RESTING_ROW_COUNT }, (_unused, index) => index)

/**
 * The two slots the `stat` key declares, closed over one course.
 *
 * @param course - The course being drawn.
 */
const courseSlots = (course: MyCoursesProgressCourse): TreeSlots<"stat"> => ({
    meta: () => <span data-part="title">{course.title}</span>,
    body: () => (
        <>
            <progress data-part="bar" value={course.percent} max={100} aria-label={course.title} />
            <span data-part="percent">{course.percentText}</span>
        </>
    ),
})

/**
 * The two slots a resting row draws - the same `stat` key, the same two roles, with
 * nothing yet to put in them.
 *
 * @param loading - Copy that stands in for a title that has not arrived.
 */
const restingSlots = (loading: string): TreeSlots<"stat"> => ({
    meta: () => <span data-part="title">{loading}</span>,
    body: () => <progress data-part="bar" aria-label={loading} />,
})

/**
 * Render the course list. See the file header for why these three keys.
 *
 * @param props - {@link MyCoursesProgressProps}
 */
export const _MyCoursesProgress = ({
    isSkeleton = false,
    isEmpty = false,
    courses = [],
    labels,
}: MyCoursesProgressProps) => {
    /** The `heading` role of the `section-header` key. */
    const HeaderTitle = () => <h2>{labels.heading}</h2>

    /** The `meta` role of the `section-header` key: the count, on the heading's baseline. */
    const HeaderCount = ({ isSkeleton: resting }: TreeSlotProps) => (
        <span data-part="count" data-state={resting === true ? "skeleton" : "ready"}>
            {resting === true ? labels.loading : labels.count}
        </span>
    )

    /** The `heading` role of the `section` key. */
    const Header = ({ isSkeleton: resting }: TreeSlotProps) => (
        <Tree name="section-header" isSkeleton={resting} slots={{ heading: HeaderTitle, meta: HeaderCount }} />
    )

    /** The `body` role of the `section` key: the rows, resting or real. */
    const Body = ({ isSkeleton: resting }: TreeSlotProps) => {
        if (resting === true) {
            return (
                <ul data-part="courses" data-state="skeleton">
                    {RESTING_ROWS.map((index) => (
                        <li key={index} data-part="course" aria-hidden="true">
                            <Tree name="stat" slots={restingSlots(labels.loading)} />
                        </li>
                    ))}
                </ul>
            )
        }
        if (isEmpty) {
            return <p data-part="courses" data-state="empty">{labels.empty}</p>
        }
        return (
            <ul data-part="courses" data-state="ready">
                {courses.map((course) => (
                    <li key={course.id} data-part="course">
                        <Tree name="stat" slots={courseSlots(course)} />
                    </li>
                ))}
            </ul>
        )
    }

    return <Tree name="section" isSkeleton={isSkeleton} slots={{ heading: Header, body: Body }} />
}

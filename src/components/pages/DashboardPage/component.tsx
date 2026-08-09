import { Tree } from "@/components/frames/Tree"
import { IdentityStats } from "@/components/blocks/dashboard/IdentityStats"
import { MyCoursesProgress } from "@/components/blocks/dashboard/MyCoursesProgress"
import { StreakStrip } from "@/components/blocks/dashboard/StreakStrip"

/**
 * PAGE - `DashboardPage`, presentational half.
 *
 * The dashboard is one scrolling column with a supporting rail, and that shape is a
 * registry key rather than a decision made here: `split` says the rail SUPPORTS the
 * body rather than competing with it, so at a narrow width it drops underneath instead
 * of halving the room the progress column needs. The two `section` keys carry the seams
 * that tell a reader which heading the content below belongs to.
 *
 * What this page does NOT do is fetch. Each block owns its own request, so a slow one
 * rests on its own without holding the page behind it. The page's only job is where
 * they sit.
 */

/** Every string the page renders, already resolved by the connected half. */
export interface DashboardPageLabels {
    /** The page title. */
    title: string
    /** Heading over the two progress blocks. */
    progressHeading: string
}

/** Props for {@link _DashboardPage} - presentational; no fetch, no store, no i18n. */
export interface DashboardPageProps {
    /** Resolved copy. */
    labels: DashboardPageLabels
}

/** The `aside` role of the `split` key: who the reader is, and where they stand. */
const Rail = () => <IdentityStats />

/** The `body` role of the inner `section`: the two progress blocks, in reading order. */
const ProgressBody = () => (
    <>
        <StreakStrip />
        <MyCoursesProgress />
    </>
)

/**
 * Render the dashboard. See the file header for why these keys.
 *
 * @param props - {@link DashboardPageProps}
 */
export const _DashboardPage = ({ labels }: DashboardPageProps) => {
    /** The `heading` role of the outer `section`. */
    const Title = () => <h1>{labels.title}</h1>

    /** The `heading` role of the inner `section`. */
    const ProgressHeading = () => <h2>{labels.progressHeading}</h2>

    /** The `body` role of the `split` key: everything the reader came to read. */
    const MainColumn = () => (
        <Tree name="section" slots={{ heading: ProgressHeading, body: ProgressBody }} />
    )

    /** The `body` role of the outer `section`. */
    const Body = () => <Tree name="split" slots={{ body: MainColumn, aside: Rail }} />

    return <Tree name="section" slots={{ heading: Title, body: Body }} />
}

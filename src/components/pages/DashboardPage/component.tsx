import { Button } from "@/components/atoms/Button"
import { Heading } from "@/components/atoms/Heading"
import { Link } from "@/components/atoms/Link"
import { Tree } from "@/components/frames/Tree"
import { EmptyState } from "@/components/composites/feedback/EmptyState"
import { SurfaceCard } from "@/components/composites/cards/SurfaceCard"
import { IdentityStats } from "@/components/blocks/dashboard/IdentityStats"
import { MyCoursesProgress } from "@/components/blocks/dashboard/MyCoursesProgress"
import { StreakStrip } from "@/components/blocks/dashboard/StreakStrip"

/**
 * PAGE - `DashboardPage`, presentational half.
 *
 * The dashboard is one scrolling column with a supporting rail, and that shape is a
 * registry key rather than a decision made here: `split` says the rail SUPPORTS the
 * body rather than competing with it, so at a narrow width it drops underneath instead
 * of halving the room the progress column needs. The rail is a `card` because that is what it
 * is in the live product - one bounded surface holding the viewer's standing, with the action
 * that ends the session closing it.
 *
 * THE SIGNED-OUT VIEW IS A DESIGN, NOT A FALLBACK. Every figure on this page comes from an
 * auth-gated request, so a visitor with no session is the commonest reader this screen has. They
 * used to get four regions of shimmer that never resolved - a page saying "wait" when the honest
 * answer was "sign in". They now get one panel that says so and the control that fixes it, and
 * the blocks are not mounted at all: three rows reading "sign in to see" beside a panel that
 * already said it is the same sentence four times.
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
    /** Heading over the rail's standing rows. */
    railHeading: string
    /** The label of the control that ends the session. */
    signOut: string
    /** What a reader with no session is told, in place of the whole dashboard. */
    signedOutTitle: string
    /** The label of the control that starts a session. */
    signIn: string
}

/** Props for {@link _DashboardPage} - presentational; no fetch, no store, no i18n. */
export interface DashboardPageProps {
    /** Resolved copy. */
    labels: DashboardPageLabels
    /**
     * Nobody is signed in. Not a loading state and not an error: it is a settled fact about the
     * reader, and it decides which of two pages this is.
     */
    isSignedOut?: boolean
    /** Ends the session. Only ever reachable while there is one. */
    onSignOut?: () => void
}

/** Where a reader with no session is sent. The routed sign-in, which needs no shell to summon. */
const SIGN_IN_HREF = "/authentication"

/** The `body` role of the inner `section`: the two progress blocks, in reading order. */
const ProgressBody = () => (
    <>
        <StreakStrip />
        <MyCoursesProgress />
    </>
)

/** The `body` role of the rail `card`: the three standing rows. */
const RailStats = () => <IdentityStats />

/**
 * Render the dashboard. See the file header for why these keys.
 *
 * @param props - {@link DashboardPageProps}
 */
export const _DashboardPage = ({ labels, isSignedOut = false, onSignOut }: DashboardPageProps) => {
    /**
     * The `heading` role of the outer `section`. `level={1}` because this is the name of the
     * PAGE, and the atom turns that one word into both the tag a screen reader builds the
     * outline from and the size a reader sees - so the two cannot disagree.
     */
    const Title = () => <Heading level={1}>{labels.title}</Heading>

    /** The `heading` role of the inner `section` - a section of the page, so `level={2}`. */
    const ProgressHeading = () => <Heading level={2}>{labels.progressHeading}</Heading>

    /** The `footer` role of the rail card: the one action a signed-in reader has here. */
    const RailAction = () => (
        <Button variant="ghost" size="sm" icon="signIn" onClick={onSignOut}>
            {labels.signOut}
        </Button>
    )

    /** The `aside` role of the `split` key: who the reader is, and where they stand. */
    const Rail = () => (
        <SurfaceCard label={labels.railHeading} body={RailStats} footer={RailAction} />
    )

    /** The `body` role of the `split` key: everything the reader came to read. */
    const MainColumn = () => (
        <Tree contract="section" slots={{ heading: ProgressHeading, body: ProgressBody }} />
    )

    /**
     * The `action` role of the signed-out empty state.
     *
     * A LINK rather than a button, because it changes the address: a reader can open the sign-in
     * in a new tab, copy it, or see where it goes before pressing - none of which a button that
     * navigates would let them do.
     */
    const SignedOutAction = () => (
        <Link href={SIGN_IN_HREF} icon="signIn" emphasis="primary">
            {labels.signIn}
        </Link>
    )

    /** The `body` role of the outer `section`: the dashboard, or the reason there is none. */
    const Body = () => {
        if (isSignedOut) {
            return (
                <EmptyState
                    icon="signIn"
                    title={labels.signedOutTitle}
                    action={SignedOutAction}
                    level={2}
                />
            )
        }
        return <Tree contract="split" slots={{ body: MainColumn, aside: Rail }} />
    }

    return <Tree contract="section" slots={{ heading: Title, body: Body }} />
}

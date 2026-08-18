import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type LeafProps,
} from "@/components/contracts/props"
import { Pagination } from "@/components/leaves/Pagination"
import { CourseCatalogCard } from "@/components/blocks/courses/CourseCatalogCard"
import { type CourseCatalogCardData } from "@/components/blocks/courses/CourseCatalogCard/component"
import { MyCoursesProgress } from "@/components/blocks/dashboard/MyCoursesProgress"

/**
 * PAGE - `CoursesCatalogPage`: the course catalog, grouped by whether the learner already owns it.
 *
 * Target path: `src/components/pages/CoursesCatalogPage/component.tsx`.
 *
 * THE SELECTED DIRECTION, `direction-enrollment-split`. Production renders one ungrouped grid, so a
 * reader tells an owned course from a purchasable one by reading its button. Here the section
 * answers that question before any card is read, and each section keeps ONE action meaning:
 * resume above, open below.
 *
 * THE TOOLBAR NARROWS BOTH GROUPS AT ONCE, which is why it sits above them rather than inside
 * either. A search that filtered only the discover grid would quietly hide a course the learner
 * already paid for.
 *
 * SKELETONS COVER ONLY WHAT IS PENDING. The section titles and the toolbar are known before any
 * request settles, so they render as themselves while the cards rest.
 *
 * EVERY NODE HERE IS A REGISTRY KEY. The page opens no host of its own and writes no layout class.
 * It reuses `page-header-stack` for the trail over the title, which the leaderboard reaches for too,
 * rather than the entry an earlier revision invented for the same relationship.
 */

/** The situations the page can be in. */
export type CoursesCatalogPageState =
    | "pending"
    | "ready"
    | "empty"
    | "filtered-empty"
    | "failed"

/** Every already-resolved string the page renders. */
export type CoursesCatalogPageLabels = {
    /** Breadcrumb root crumb. */
    readonly navHome: string
    /** Breadcrumb current crumb. */
    readonly navCourses: string
    /** Page title. */
    readonly title: string
    /** Search field placeholder. */
    readonly searchPlaceholder: string
    /** Accessible name for the search field. */
    readonly searchLabel: string
    /** Accessible name for the control that empties the search field. */
    readonly searchClearLabel: string
    /** Accessible name for the layout toggle. */
    readonly viewLabel: string
    /** Grid layout tab label. */
    readonly viewGrid: string
    /** Line layout tab label. */
    readonly viewLine: string
    /** Discover group title. */
    readonly discoverTitle: string
    /** Accessible name for the pager. */
    readonly pageLabel: string
    /** Accessible name for the previous-page control. */
    readonly previousPageLabel: string
    /** Accessible name for the next-page control. */
    readonly nextPageLabel: string
}

/** What the page draws. */
export type CoursesCatalogPageData = {
    readonly labels: CoursesCatalogPageLabels
    /** Already-localized result count, e.g. "5 courses". Absent while nothing is counted yet. */
    readonly countLabel?: string
    /** The live search text. */
    readonly query?: string
    /** Which layout is selected. */
    readonly view?: "grid" | "line"
    /** Whether the learner owns any course at all, which is all this page decides about them. */
    readonly hasOwned?: boolean
    /** Purchasable courses. */
    readonly discover?: ReadonlyArray<CourseCatalogCardData>
    /** 1-based showing page. */
    readonly page?: number
    /** Total pages. */
    readonly totalPages?: number
    /** The message shown when nothing matches or nothing loaded. */
    readonly noticeMessage?: string
    /** The recovery action label beside that message. */
    readonly noticeActionLabel?: string
}

/** What the page reports. */
export type CoursesCatalogPageActions = {
    readonly search?: (query: string) => void
    readonly changeView?: (view: string) => void
    readonly changePage?: (page: number) => void
    readonly recover?: () => void
    /** Called when the reader follows the breadcrumb back to the dashboard. */
    readonly goHome?: () => void
    readonly [key: string]: ((...args: Array<never>) => void) | undefined
}

/** Props for {@link _CoursesCatalogPage}. */
export type CoursesCatalogPageProps = {
    readonly state: CoursesCatalogPageState
    readonly props: CoursesCatalogPageData
    readonly on?: CoursesCatalogPageActions
}

/** How many resting cards the discover group shows while the first page is in flight. */
const RESTING_COUNT = 3

/** What the joined list draws: the rows, plus the frame words `SurfaceListCard` owns. */
type CatalogLineListData = SurfaceListCardData & {
    readonly courses: ReadonlyArray<CourseCatalogCardData>
}

/**
 * The rows of the list view, as the component lane `SurfaceListCard` takes.
 *
 * The branch hands data and actions back rather than accepting a closed descriptor, so the rows are
 * built here from `props` and reach their journeys through `on` - the same shape the dashboard's
 * own joined lists use, which is why this is a component rather than a record of slots.
 */
const CatalogLineListView = ({ props, on, isLoading = false }: LeafProps<CatalogLineListData, CoursesCatalogPageActions>) => (
    <Tree
        contract="catalog-card-list"
        render={defineContractComponent("catalog-card-list", {
            course: props.courses.map((course) => defineContractProjection("catalog-card-line", () => (
                <CourseCatalogCard
                    state={isLoading ? "pending" : "ready"}
                    course={{ ...course, layout: "line" }}
                    onView={on?.[`view:${course.id}`]}
                    onOpenPriceDetail={on?.[`priceDetail:${course.id}`]}
                />
            ))),
        })}
    />
)

/** Stable component type branded for the exact list contract it implements. */
const CatalogLineList = defineContractComponent("catalog-card-list", CatalogLineListView)

/**
 * Draw the catalog.
 *
 * @param input - {@link CoursesCatalogPageProps}
 */
export const _CoursesCatalogPage = (input: CoursesCatalogPageProps) => {
    const labels = input.props.labels
    const isLoading = input.state === "pending"
    const discover = input.props.discover ?? []
    const showsNotice =
        input.state === "empty" || input.state === "filtered-empty" || input.state === "failed"

    const restingCards: ReadonlyArray<CourseCatalogCardData> = Array.from(
        { length: RESTING_COUNT },
        (_unused, index) => ({ id: `resting-${index + 1}` }),
    )

    // `page-header-stack` already owned "where the reader is, above what this page is", and the
    // leaderboard reaches for it too. An earlier revision invented a second entry for the same
    // relationship and drew the trail as one `Text` with a hand-written separator, which is not a
    // breadcrumb: it announces as a sentence, offers no destination, and cannot be navigated.
    const header = defineContractComponent("page-header-stack", {
        trail: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs
                props={{
                    label: labels.title,
                    steps: [
                        { id: "home", label: labels.navHome },
                        { id: "courses", label: labels.navCourses },
                    ],
                }}
                on={{ home: input.on?.goHome }}
            />
        )),
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: labels.title, level: 1 }} />
        )),
    })

    const toolbar = defineContractComponent("catalog-search-count-view-row", {
        // THE COUNT BELONGS TO THE FIELD THAT PRODUCED IT. Standing at the far end of the row it
        // read as a caption for the layout toggle beside it, and it arrived after first paint -
        // which reflowed the row under a control that had already measured its own position.
        search: defineContractComponent("catalog-query-with-count", {
            query: defineLeafComponent("search-box", {}, () => (
                <SearchBox
                    props={{
                        placeholder: labels.searchPlaceholder,
                        label: labels.searchLabel,
                        clearLabel: labels.searchClearLabel,
                    }}
                    on={{ search: input.on?.search }}
                />
            )),
            ...(input.props.countLabel === undefined ? {} : {
                count: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: input.props.countLabel, size: "sm", tone: "muted" }} />
                )),
            }),
        }),
        // `variant: "primary"` is the segmented pill, not the underline. `ChoiceTabs` defaults
        // to `"secondary"`, which draws a filter underline, and an earlier revision took that
        // default by omission. The legacy catalog and the legacy league page both pass
        // `"primary"` here for the reason the legacy source states beside it: these tabs switch
        // the WHOLE panel rather than filtering the list under them, and a pill says so.
        view: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs
                props={{
                    label: labels.viewLabel,
                    selectedKey: input.props.view ?? "grid",
                    variant: "primary",
                    tabs: [
                        { id: "grid", label: labels.viewGrid, icon: "viewGrid" },
                        { id: "line", label: labels.viewLine, icon: "viewList" },
                    ],
                }}
                on={{ select: input.on?.changeView }}
            />
        )),
    })

    /*
     * THE COURSES THE LEARNER OWNS ARE DRAWN BY THE BLOCK THE DASHBOARD ALREADY USES.
     *
     * This page once had a card of its own for them: cover, title, a single progress bar and a
     * resume button. It was the same statement as `MyCoursesProgress` in a second handwriting -
     * one bar where that block shows content, challenges and milestones as three, one button where
     * that block makes the whole row the way back in. Two answers to "where did I stop" is one
     * answer too many, and the reader met both in the same product.
     *
     * So the page states WHERE the group goes and the block states what it says. The page keeps no
     * owned-course labels, no progress phrasing and no resume action, because it no longer draws
     * any of them.
     */
    const ownedGroup = defineContractProjection("course-progress-list", () => <MyCoursesProgress />)

    /*
     * THE TOGGLE CHOOSES THE CONTAINER AND THE CARD TOGETHER, because it is one decision.
     *
     * It used to choose neither. The selected key travelled from the page down to the tabs and
     * back into the pill that produced it, and nothing else read it - so pressing the list option
     * moved the pill and re-rendered the identical three-column grid. A control that reports a
     * choice nobody acts on is worse than an absent one: the reader concludes the layout is broken
     * rather than that it is missing.
     */
    const isLine = input.props.view === "line"
    const courses = isLoading ? restingCards : discover

    const card = (course: CourseCatalogCardData) => () => (
        <CourseCatalogCard
            state={isLoading ? "pending" : "ready"}
            course={{ ...course, layout: isLine ? "line" : "grid" }}
            onView={input.on?.[`view:${course.id}`]}
            onOpenPriceDetail={input.on?.[`priceDetail:${course.id}`]}
        />
    )

    const discoverGroup = defineContractComponent("catalog-section-group", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: labels.discoverTitle, level: 2 }} />
        )),
        /*
         * THE LIST IS ONE SURFACE, THE GRID IS MANY. Scanning twenty courses down a column is not
         * reading twenty cards: every card edge is a stop, and the reader pays for all of them. So
         * the rows share the joined surface `SurfaceListCard` draws - one ground, one rule between
         * rows, the inset owned row by row so every divider reaches both edges - and each row draws
         * no card of its own. Side by side, three cards are three objects and each keeps its edge.
         *
         * The label is hidden rather than absent: the section above already says "explore", and the
         * surface would otherwise say it a second time directly beneath it.
         */
        grid: isLine
            ? defineContractProjection("catalog-card-list", () => (
                <SurfaceListCard
                    contract="catalog-card-list"
                    render={CatalogLineList}
                    props={{ label: labels.discoverTitle, isLabelHidden: true, courses: [...courses] }}
                    on={input.on}
                    isLoading={isLoading}
                />
            ))
            : defineContractComponent("catalog-card-grid", {
                course: courses.map((course) => defineContractProjection("catalog-card", card(course))),
            }),
    })

    /*
     * THE PAGER IS ALWAYS THERE ONCE THERE ARE RESULTS, even at one page.
     *
     * This is not an oversight and not a taste call - the legacy catalog carries the same decision
     * beside the same control, recorded as the teacher's: do not hide the pager at or below one
     * page, because the catalog's page boundary is part of what the surface promises and a control
     * that appears the day a tenth course is published moves everything under it on that day.
     *
     * It stays omitted while the request is in flight and behind a notice, where there is no result
     * set to bound: a control that may never appear should not reserve a place by shimmering.
     */
    const totalPages = input.props.totalPages
    const showsPager = !showsNotice && !isLoading && totalPages !== undefined

    return (
        <Tree
            contract="courses-catalog-page"
            render={defineContractComponent("courses-catalog-page", {
                header,
                toolbar,
                // An absent group is an ABSENT SLOT, not a slot holding null. The entry marks both
                // optional, so the owned group simply does not exist for a learner who owns nothing
                // and neither group exists behind a notice.
                ...(showsNotice || input.props.hasOwned !== true ? {} : { owned: ownedGroup }),
                ...(showsNotice ? {} : { discover: discoverGroup }),
                ...(showsNotice ? {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{
                                icon: "course",
                                message: input.props.noticeMessage ?? "",
                                actionLabel: input.props.noticeActionLabel,
                            }}
                            on={{ act: input.on?.recover }}
                        />
                    )),
                } : {}),
                ...(showsPager ? {
                    pager: defineLeafComponent("pagination", {}, () => (
                        <Pagination
                            props={{
                                label: labels.pageLabel,
                                total: totalPages,
                                page: input.props.page ?? 1,
                                previousLabel: labels.previousPageLabel,
                                nextLabel: labels.nextPageLabel,
                            }}
                            on={{ change: input.on?.changePage }}
                        />
                    )),
                } : {}),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const

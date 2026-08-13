import { EmptyNotice } from "@/components/composites/EmptyNotice"
// The PROPOSED ChoiceTabs, not the locked one: this control needs the optional leading glyph.
// Its target path is the locked file, and the delta is one optional slot.
import { ChoiceTabs } from "~candidate/components/leaves/ChoiceTabs"
import { Heading } from "@/components/leaves/Heading"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import { Tree } from "~candidate/components/branches/Tree"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "~candidate/components/contracts/props"
import { Pagination } from "~candidate/components/leaves/Pagination"
import {
    _CourseCatalogCard,
    type CourseCatalogCardData,
} from "~candidate/components/blocks/CourseCatalogCard/component"
import {
    _EnrolledCourseCard,
    type EnrolledCourseCardData,
} from "~candidate/components/blocks/EnrolledCourseCard/component"

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
 * EVERY NODE HERE IS A REGISTRY KEY. The page opens no host of its own and writes no layout class:
 * `courses-catalog-page` and `catalog-trail-over-title` were the last two shapes this page decided
 * inline, and they are entries in the candidate registry rather than divs written here.
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
    /** Accessible name for the layout toggle. */
    readonly viewLabel: string
    /** Grid layout tab label. */
    readonly viewGrid: string
    /** Line layout tab label. */
    readonly viewLine: string
    /** Owned-courses group title. */
    readonly ownedTitle: string
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
    /** Owned courses. Empty collapses the group entirely rather than titling nothing. */
    readonly owned?: ReadonlyArray<EnrolledCourseCardData>
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

/**
 * Draw the catalog.
 *
 * @param input - {@link CoursesCatalogPageProps}
 */
export const _CoursesCatalogPage = (input: CoursesCatalogPageProps) => {
    const labels = input.props.labels
    const isLoading = input.state === "pending"
    const owned = input.props.owned ?? []
    const discover = input.props.discover ?? []
    const showsNotice =
        input.state === "empty" || input.state === "filtered-empty" || input.state === "failed"

    const restingCards: ReadonlyArray<CourseCatalogCardData> = Array.from(
        { length: RESTING_COUNT },
        (_unused, index) => ({ id: `resting-${index + 1}` }),
    )

    const heading = defineContractComponent("catalog-trail-over-title", {
        trail: defineLeafComponent("text", { size: "xs" }, () => (
            <Text props={{ content: `${labels.navHome} › ${labels.navCourses}`, size: "xs" }} />
        )),
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: labels.title, level: 1 }} />
        )),
    })

    const toolbar = defineContractComponent("catalog-search-count-view-row", {
        query: defineLeafComponent("search-box", {}, () => (
            <SearchBox
                props={{ placeholder: labels.searchPlaceholder, label: labels.searchLabel }}
                on={{ search: input.on?.search }}
            />
        )),
        ...(input.props.countLabel === undefined ? {} : {
            count: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: input.props.countLabel, size: "sm", tone: "muted" }} />
            )),
        }),
        // `variant: "primary"` is the segmented pill, not the underline. `ChoiceTabs` defaults to
        // `"secondary"`, which draws a filter underline, and an earlier revision took that default
        // by omission. The legacy catalog and the legacy league page both pass `"primary"` here for
        // the reason the legacy source states beside it: these tabs switch the WHOLE panel rather
        // than filtering the list under them, and a segmented pill is what says so.
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

    const ownedGroup = defineContractComponent("catalog-section-group", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: labels.ownedTitle, level: 2 }} />
        )),
        grid: defineContractComponent("catalog-card-grid", {
            course: owned.map((course) => defineContractProjection("enrolled-course-card", () => (
                <_EnrolledCourseCard
                    state={isLoading ? "pending" : "ready"}
                    props={course}
                    on={{ resume: input.on?.[`resume:${course.id}`] }}
                />
            ))),
        }),
    })

    const discoverGroup = defineContractComponent("catalog-section-group", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: labels.discoverTitle, level: 2 }} />
        )),
        grid: defineContractComponent("catalog-card-grid", {
            course: (isLoading ? restingCards : discover).map((course) => defineContractProjection("catalog-card", () => (
                <_CourseCatalogCard
                    state={isLoading ? "pending" : "ready"}
                    props={course}
                    on={{ view: input.on?.[`view:${course.id}`] }}
                />
            ))),
        }),
    })

    // The pager is omitted, not rested, while the total is unknown: a control that may never appear
    // should not reserve a place by shimmering.
    const showsPager =
        !showsNotice &&
        !isLoading &&
        input.props.totalPages !== undefined &&
        input.props.totalPages > 1

    return (
        <Tree
            contract="courses-catalog-page"
            render={defineContractComponent("courses-catalog-page", {
                heading,
                toolbar,
                // An absent group is an ABSENT SLOT, not a slot holding null. The entry marks both
                // optional, so the owned group simply does not exist for a learner who owns nothing
                // and neither group exists behind a notice.
                ...(showsNotice || owned.length === 0 ? {} : { owned: ownedGroup }),
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
                                total: input.props.totalPages ?? 1,
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

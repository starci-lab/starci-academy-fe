"use client"

import { useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { CoursePriceOverlay } from "@/components/overlays/courses/CoursePriceOverlay"
import { useRouter } from "@/i18n/navigation"
import { useQueryCoursesSwr, useQueryMyCoursesSwr } from "@/hooks"
import { _CoursesCatalogPage, type CoursesCatalogPageState } from "./component"

/** Courses per page. Three columns times three rows on a desktop grid. */
const PAGE_SIZE = 9

/** One phase row: what that phase charges, when it overrides the list price. */
type CoursePhaseRow = {
    readonly phase: string
    readonly price?: number | null
}

/** The part of a catalog course {@link priceOf} reads - the list price and the phase ladder. */
type PricedCourse = {
    readonly originalPrice: number
    readonly currentPhase?: string
    readonly pricingPhases?: ReadonlyArray<CoursePhaseRow>
}

/**
 * The course catalog, connected.
 *
 * IT READS TWO ANSWERS, NOT ONE. The owned group comes from `myCourses`, which is the only source
 * that knows how far this learner got; the discover group comes from the paginated `courses` list.
 * Merging them server-side would have made the catalog a personalised query and lost its cache.
 *
 * THE PAGER SPEAKS HUMAN NUMBERS AND THE REQUEST DOES NOT. `Pagination` is 1-based because that is
 * what it draws; the request is ZERO-based, and that is measured rather than assumed. The two sides
 * disagreed in writing - this repository's `PaginationFilters` says zero-based, the backend's
 * `PaginationPageFilters` says 1-based - so it was settled against the running server: with five
 * courses and a limit of three, `pageNumber: 0` returns the first three and `pageNumber: 1` returns
 * the remaining two. The conversion happens on the line marked below and nowhere else.
 *
 * IT ASKS FOR NO SORT, AND THAT IS NOT LAZINESS. The `courses` query reads a per-locale
 * Elasticsearch index, and that index carries none of the three fields `SortBy` offers in a
 * sortable form: `title` has no `.keyword` subfield, and `createdAt` and `updatedAt` are not indexed
 * at all. Every enum value therefore fails the whole request with a shard exception, which is how
 * this page first rendered as a failure. An empty sort list is the only request the index can
 * answer - and it matches the legacy catalog, which ordered courses client-side rather than asking
 * the server to.
 */
export const CoursesCatalogPage = () => {
    const t = useTranslations("courses.catalog")
    // `count` is the catalog-wide phrase and already lives one level up, beside the dashboard list
    // that also counts courses. Reaching for it here rather than copying it keeps one sentence for
    // one fact - the first render printed the raw key, which is what a missing lookup looks like.
    const tCourses = useTranslations("courses")
    const locale = useLocale()
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [page, setPage] = useState(1)
    const [view, setView] = useState<"grid" | "line">("grid")
    /*
     * WHICH COURSE IS EXPLAINING ITS PRICE IS THE PAGE'S STATE, not each card's.
     *
     * A card that held its own covering surface would put twenty focus traps and twenty backdrops
     * in one document, and only one of them can ever be on screen. It is also not a card's business:
     * a connected block renders its own pure twin and nothing else, and a summoned surface lives in
     * `overlays/` where the next screen that needs one can find it.
     */
    const [pricedCourseId, setPricedCourseId] = useState<string | undefined>(undefined)

    const filters = useMemo(
        () => ({
            // No sort clause. See the note above: every member of `SortBy` fails against the
            // per-locale index, so asking for one fails the whole request rather than ordering it.
            sorts: [],
            limit: PAGE_SIZE,
            // The one conversion, measured against the running server. See the note above.
            pageNumber: page - 1,
            ...(query.trim() === "" ? {} : { search: query.trim() }),
        }),
        [page, query],
    )

    const catalog = useQueryCoursesSwr({ filters })
    const mine = useQueryMyCoursesSwr()

    const money = useMemo(
        () => new Intl.NumberFormat(locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 }),
        [locale],
    )

    // The owned group is a whole block with its own request and its own phrasing, so this page
    // decides only WHETHER it appears. Resolving rows here would make the page a second reader of
    // `myCourses`, free to disagree with the first about what a course's progress says.
    const hasOwned = (mine.data ?? []).length > 0

    /*
     * A COURSE THE LEARNER OWNS IS NOT SOMETHING TO DISCOVER.
     *
     * The two answers are independent lists and the catalog query knows nothing about enrolment, so
     * a course the learner is already taking came back in both groups: once under "in progress"
     * with its meter, and again under "explore" with a price and a buy-shaped action. That is the
     * exact confusion this direction was chosen to remove - the whole point of grouping by
     * enrolment was that section membership answers "do I own this" so the reader never has to.
     *
     * Matched on `isEnrolled` as well as on identity, because the list carries the viewer's own
     * enrolment flag and it is the cheaper, more direct answer when the owned list has not
     * arrived yet.
     */
    /**
     * What the course actually costs today, and what that saves against the list price.
     *
     * The phase row for `currentPhase` is the price being charged; `originalPrice` is what it is
     * charged against. When the two agree - or the phase carries no override - there is no discount,
     * so the struck price, the percentage and the savings sentence are all ABSENT rather than
     * present-and-zero. An earlier revision printed the list price alone and silently dropped a
     * 26 percent discount the product was actually running.
     *
     * This is the same computation the legacy catalog card makes. The loyalty price sits one layer
     * above it in `coursePricePreview`, which needs a signed-in viewer, so it cannot be what a
     * catalog open to guests prices from.
     */
    const priceOf = (course: PricedCourse) => {
        const phasePrice = course.pricingPhases?.find((row) => row.phase === course.currentPhase)?.price
        const payable = phasePrice ?? course.originalPrice
        if (payable >= course.originalPrice) return { price: money.format(payable) }
        const saved = course.originalPrice - payable
        return {
            price: money.format(payable),
            originalPrice: money.format(course.originalPrice),
            discountLabel: t("discount", { percent: Math.round((saved / course.originalPrice) * 100) }),
            savingsLabel: t("savings", { amount: money.format(saved) }),
        }
    }

    const ownedIds = new Set((mine.data ?? []).map((course) => course.globalId))
    const discover = (catalog.data?.data ?? [])
        .filter((course) => course.isEnrolled !== true && !ownedIds.has(course.id))
        .map((course) => ({
            id: course.id,
            title: course.title,
            cover: course.coverImageUrl ?? null,
            enrolmentLabel: t("enrolment", { count: course.enrollmentCount }),
            ...priceOf(course),
            promisesSummary: t("promises", { count: course.valuePropositions?.length ?? 0 }),
            promises: [...(course.valuePropositions ?? [])]
                .sort((left, right) => left.orderIndex - right.orderIndex)
                .map((proposition) => proposition.text),
            viewLabel: t("view"),
        }))

    const count = catalog.data?.count ?? 0
    const isSearching = query.trim() !== ""

    /*
     * `null` IS A FAILURE, NOT AN EMPTY LIST, and the difference is the whole point of these three
     * lines. The hook unwraps the envelope with `?? null`, so a server that answers
     * `success: false` - a failed search, an unavailable index - lands here as `null`, exactly like
     * a successful request would if it carried no payload. Reading `null` as "loaded, nothing
     * there" told the reader there are no courses when in truth nothing was ever fetched, and the
     * running page said precisely that.
     *
     * `undefined` is SWR's "not yet"; `null` is the server declining to answer. An empty catalog is
     * a real payload with a zero count, which is the `ready` branch below.
     */
    const failed = catalog.error !== undefined || catalog.data === null
    const pending = catalog.data === undefined && !failed

    const state: CoursesCatalogPageState = failed
        ? "failed"
        : pending
            ? "pending"
            // The owned group is a second, independent answer, so it does not vote here. A catalog
            // with nothing to discover is empty even when the learner owns courses, because the
            // notice speaks for the list the toolbar narrows and `myCourses` is not that list.
            : discover.length === 0
                ? (isSearching ? "filtered-empty" : "empty")
                : "ready"

    const notice = state === "failed"
        ? { noticeMessage: t("failed"), noticeActionLabel: t("retry") }
        : state === "filtered-empty"
            ? { noticeMessage: t("filteredEmpty"), noticeActionLabel: t("clearFilter") }
            : state === "empty"
                ? { noticeMessage: t("empty"), noticeActionLabel: t("emptyAction") }
                : {}

    return (
        <>
            <_CoursesCatalogPage
                state={state}
                props={{
                    labels: {
                        navHome: t("navHome"),
                        navCourses: t("navCourses"),
                        title: t("title"),
                        searchPlaceholder: t("searchPlaceholder"),
                        searchLabel: t("searchLabel"),
                        searchClearLabel: t("searchClearLabel"),
                        viewLabel: t("viewLabel"),
                        viewGrid: t("viewGrid"),
                        viewLine: t("viewLine"),
                        discoverTitle: t("discoverTitle"),
                        pageLabel: t("pageLabel"),
                        previousPageLabel: t("previousPage"),
                        nextPageLabel: t("nextPage"),
                    },
                    ...(count > 0 ? { countLabel: tCourses("count", { count }) } : {}),
                    query,
                    view,
                    hasOwned,
                    discover,
                    page,
                    totalPages: Math.max(1, Math.ceil(count / PAGE_SIZE)),
                    ...notice,
                }}
                on={{
                    search: (next: string) => {
                        setQuery(next)
                        // A new search is a new list, so it starts at its own first page rather than
                        // landing on page four of an answer that no longer exists.
                        setPage(1)
                    },
                    goHome: () => router.push("/dashboard"),
                    changeView: (next: string) => setView(next === "line" ? "line" : "grid"),
                    changePage: setPage,
                    recover: () => {
                        if (state === "failed") void catalog.mutate()
                        else if (state === "filtered-empty") { setQuery(""); setPage(1) }
                        else router.push("/dashboard")
                    },
                    ...Object.fromEntries(discover.map((course) => [
                        `view:${course.id}`,
                        () => router.push(`/courses/${course.id}`),
                    ])),
                    ...Object.fromEntries(discover.map((course) => [
                        `priceDetail:${course.id}`,
                        () => setPricedCourseId(course.id),
                    ])),
                }}
            />
            <CoursePriceOverlay
                courseId={pricedCourseId}
                title={discover.find((course) => course.id === pricedCourseId)?.title}
                isOpen={pricedCourseId !== undefined}
                onDismiss={() => setPricedCourseId(undefined)}
            />
        </>
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "courses" } as const

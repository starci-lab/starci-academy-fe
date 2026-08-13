"use client"

import { useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useQueryCoursesSwr, useQueryMyCoursesSwr } from "@/hooks"
import { _CoursesCatalogPage, type CoursesCatalogPageState } from "./component"

/** Courses per page. Three columns times three rows on a desktop grid. */
const PAGE_SIZE = 9

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

    const owned = (mine.data ?? []).map((course) => ({
        id: course.globalId,
        title: course.label,
        cover: course.thumbnailUrl ?? null,
        percent: course.completionPercent,
        progressLabel: t("progress", { percent: course.completionPercent }),
        progressAriaLabel: t("progressAria", { title: course.label }),
        resumeLabel: t("resume"),
    }))

    const discover = (catalog.data?.data ?? []).map((course) => ({
        id: course.id,
        title: course.title,
        cover: course.coverImageUrl ?? null,
        enrolmentLabel: t("enrolment", { count: course.enrollmentCount }),
        // The list document carries the LIST price only. A discounted price would need
        // `coursePricePreview` per course, which this repository does not call anywhere yet, so no
        // discount badge and no savings line are drawn rather than inventing either.
        price: money.format(course.originalPrice),
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
        <_CoursesCatalogPage
            state={state}
            props={{
                labels: {
                    navHome: t("navHome"),
                    navCourses: t("navCourses"),
                    title: t("title"),
                    searchPlaceholder: t("searchPlaceholder"),
                    searchLabel: t("searchLabel"),
                    viewLabel: t("viewLabel"),
                    viewGrid: t("viewGrid"),
                    viewLine: t("viewLine"),
                    ownedTitle: t("ownedTitle"),
                    discoverTitle: t("discoverTitle"),
                    pageLabel: t("pageLabel"),
                    previousPageLabel: t("previousPage"),
                    nextPageLabel: t("nextPage"),
                },
                ...(count > 0 ? { countLabel: tCourses("count", { count }) } : {}),
                query,
                view,
                owned,
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
                ...Object.fromEntries(owned.map((course) => [
                    `resume:${course.id}`,
                    () => router.push(`/courses/${course.id}`),
                ])),
                ...Object.fromEntries(discover.map((course) => [
                    `view:${course.id}`,
                    () => router.push(`/courses/${course.id}`),
                ])),
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "courses" } as const

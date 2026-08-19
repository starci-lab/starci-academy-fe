import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CoursesCatalogPageBase, type CoursesCatalogPageLabels } from "./component"

/**
 * What these tests guard.
 *
 * The catalog answers "do I already own this?" with the section rather than with a button, so the
 * owned group exists only for a learner who owns something and neither group exists behind a
 * notice. The layout toggle chooses the container AND the card together, the pager stands whenever
 * there are results, and it stays away while a request is in flight.
 */

vi.mock("@/components/blocks/dashboard/MyCoursesProgress", () => ({
    MyCoursesProgress: () => <div data-testid="owned-progress">Owned-course progress owner</div>,
}))

/*
 * The catalog card is the CONNECTED block: it resolves its own copy and owns its own cart mutation.
 * What this page decides about it is the three things asserted below - the layout it is drawn in,
 * whether it is resting, and which outcome each of its two actions reaches.
 */
/** The three decisions this page makes about one catalog card. */
type CatalogCardStub = {
    readonly state: string
    readonly course: { readonly id: string, readonly title?: string, readonly layout?: string }
    readonly onView?: () => void
    readonly onOpenPriceDetail?: () => void
}

vi.mock("@/components/blocks/courses/CourseCatalogCard", () => ({
    CourseCatalogCard: ({ state, course, onView, onOpenPriceDetail }: CatalogCardStub) => (
        <article data-testid="catalog-card" data-card-state={state} data-layout={course.layout}>
            <span>{course.title}</span>
            <button type="button" onClick={onView}>{`Xem ${course.id}`}</button>
            {onOpenPriceDetail === undefined ? null : (
                <button type="button" onClick={onOpenPriceDetail}>{`Vì sao giá này? ${course.id}`}</button>
            )}
        </article>
    ),
}))

globalThis.ResizeObserver = class ResizeObserver {
    observe() { /* jsdom has no layout to observe. */ }
    unobserve() { /* jsdom has no layout to observe. */ }
    disconnect() { /* jsdom has no layout to observe. */ }
}

const labels: CoursesCatalogPageLabels = {
    navHome: "Trang chủ",
    navCourses: "Khóa học",
    title: "Khóa học tiêu biểu",
    searchPlaceholder: "Tìm khóa học...",
    searchLabel: "Tìm khóa học",
    searchClearLabel: "Xóa tìm kiếm",
    viewLabel: "Kiểu hiển thị",
    viewGrid: "Lưới",
    viewLine: "Danh sách",
    discoverTitle: "Khám phá",
    pageLabel: "Phân trang khóa học",
    previousPageLabel: "Trang trước",
    nextPageLabel: "Trang sau",
}

const discover = [
    { id: "course-1", title: "System Design Mastery", price: "1.750.000 ₫", viewLabel: "Xem khóa học", priceDetailLabel: "Vì sao giá này?" },
    { id: "course-2", title: "TypeScript Deep Dive", price: "1.200.000 ₫", viewLabel: "Xem khóa học" },
]

describe("CoursesCatalogPageBase", () => {
    it("keeps the catalog shell visible and renders EmptyNotice when there are no courses", () => {
        const recover = vi.fn()
        const { container } = render(
            <CoursesCatalogPageBase
                state="empty"
                props={{
                    labels,
                    countLabel: "0 khóa học",
                    discover: [],
                    noticeMessage: "Chưa có khóa học nào để hiển thị.",
                    noticeActionLabel: "Khám phá lộ trình",
                    page: 1,
                    totalPages: 1,
                }}
                on={{ recover }}
            />,
        )

        expect(screen.getByRole("heading", { name: "Khóa học tiêu biểu" })).toBeInTheDocument()
        expect(screen.getByRole("searchbox", { name: "Tìm khóa học" })).toBeInTheDocument()
        expect(screen.getByText("0 khóa học")).toBeInTheDocument()
        expect(screen.getByText("Chưa có khóa học nào để hiển thị.")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"catalog-section-group\"]")).toBeNull()
        expect(screen.queryByRole("navigation", { name: "Phân trang khóa học" })).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Khám phá lộ trình" }))
        expect(recover).toHaveBeenCalledOnce()
    })

    it("splits owned courses from the discover grid and pages the results", () => {
        const changePage = vi.fn()
        const changeView = vi.fn()
        const goHome = vi.fn()
        const { container } = render(
            <CoursesCatalogPageBase
                state="ready"
                props={{ labels, countLabel: "2 khóa học", hasOwned: true, discover, page: 1, totalPages: 3 }}
                on={{ changePage, changeView, goHome }}
            />,
        )

        expect(screen.getByTestId("owned-progress")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"catalog-card-grid\"]")).not.toBeNull()
        expect(container.querySelector("[data-node=\"catalog-card-list\"]")).toBeNull()
        expect(screen.getByText("System Design Mastery")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Khám phá" })).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Trang sau" }))
        expect(changePage).toHaveBeenCalledWith(2)

        fireEvent.click(screen.getByText("Danh sách"))
        expect(changeView).toHaveBeenCalledWith("line")

        fireEvent.click(screen.getByText("Trang chủ"))
        expect(goHome).toHaveBeenCalledOnce()
    })

    it("joins the rows onto one surface when the line layout is selected", () => {
        const view = vi.fn()
        const priceDetail = vi.fn()
        const { container } = render(
            <CoursesCatalogPageBase
                state="ready"
                props={{ labels, view: "line", discover, page: 2, totalPages: 2 }}
                on={{ "view:course-1": view, "priceDetail:course-1": priceDetail }}
            />,
        )

        expect(container.querySelector("[data-node=\"catalog-card-list\"]")).not.toBeNull()
        expect(container.querySelector("[data-node=\"catalog-card-grid\"]")).toBeNull()
        expect(screen.queryByText("2 khóa học")).not.toBeInTheDocument()
        expect(screen.queryByTestId("owned-progress")).not.toBeInTheDocument()
        expect(screen.getAllByTestId("catalog-card")[0]).toHaveAttribute("data-layout", "line")

        fireEvent.click(screen.getByRole("button", { name: "Xem course-1" }))
        expect(view).toHaveBeenCalledOnce()
        fireEvent.click(screen.getByRole("button", { name: "Vì sao giá này? course-1" }))
        expect(priceDetail).toHaveBeenCalledOnce()
    })

    it("rests three discover cards and withholds the pager until there are results to bound", () => {
        const { container } = render(
            <CoursesCatalogPageBase state="pending" props={{ labels, hasOwned: true, page: 1, totalPages: 4 }} />,
        )

        expect(screen.getAllByTestId("catalog-card")).toHaveLength(3)
        expect(screen.getAllByTestId("catalog-card")[0]).toHaveAttribute("data-card-state", "pending")
        expect(screen.getAllByTestId("catalog-card")[0]).toHaveAttribute("data-layout", "grid")
        expect(container.querySelector("[data-node=\"catalog-card-grid\"]")).not.toBeNull()
        expect(screen.queryByRole("navigation", { name: "Phân trang khóa học" })).not.toBeInTheDocument()
        expect(screen.getByTestId("owned-progress")).toBeInTheDocument()
    })

    it("rests three joined rows when the line layout is chosen before the first page lands", () => {
        const { container } = render(
            <CoursesCatalogPageBase state="pending" props={{ labels, view: "line" }} />,
        )

        expect(container.querySelector("[data-node=\"catalog-card-list\"]")).not.toBeNull()
        expect(screen.getAllByTestId("catalog-card")).toHaveLength(3)
        expect(screen.getAllByTestId("catalog-card")[0]).toHaveAttribute("data-card-state", "pending")
        expect(screen.getAllByTestId("catalog-card")[0]).toHaveAttribute("data-layout", "line")
    })

    it("keeps a filtered-empty notice wordless rather than inventing a sentence", () => {
        const { container } = render(
            <CoursesCatalogPageBase state="filtered-empty" props={{ labels, query: "khong-co", discover: [] }} />,
        )

        expect(container.querySelector("[data-node=\"empty-notice-stack\"]")).not.toBeNull()
        expect(container.querySelector("[data-node=\"catalog-section-group\"]")).toBeNull()
        expect(screen.queryByRole("button", { name: /Khám phá/ })).not.toBeInTheDocument()
    })

    it("reports a search from the toolbar that governs both groups", () => {
        const search = vi.fn()
        const { container } = render(
            <CoursesCatalogPageBase state="ready" props={{ labels, discover, totalPages: 1 }} on={{ search }} />,
        )

        fireEvent.change(screen.getByRole("searchbox", { name: "Tìm khóa học" }), { target: { value: "system" } })
        fireEvent.submit(container.querySelector("form[role=\"search\"]") as HTMLFormElement)
        expect(search).toHaveBeenCalledWith("system")
        expect(screen.getByRole("navigation", { name: "Phân trang khóa học" })).toBeInTheDocument()
    })
})

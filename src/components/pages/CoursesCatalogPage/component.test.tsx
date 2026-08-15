import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CoursesCatalogPage, type CoursesCatalogPageLabels } from "./component"

vi.mock("@/components/blocks/dashboard/MyCoursesProgress", () => ({
    MyCoursesProgress: () => <div>Owned-course progress owner</div>,
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

describe("_CoursesCatalogPage", () => {
    it("keeps the catalog shell visible and renders EmptyNotice when there are no courses", () => {
        const recover = vi.fn()
        const { container } = render(
            <_CoursesCatalogPage
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
})

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseContentMapBase, CourseContentMapPanel, type CourseContentMapLabels } from "./component"

const labels: CourseContentMapLabels = {
    progress: "Course progress",
    searchPlaceholder: "Search contents",
    searchLabel: "Search this course",
    searchClearLabel: "Clear search",
    failed: "Course outline failed",
}

describe("CourseContentMapBase", () => {
    it("renders progress before searchable source-backed module rows", () => {
        const openLesson = vi.fn()
        render(
            <CourseContentMapBase
                state="ready"
                props={{
                    labels,
                    completionPercent: 50,
                    progressFact: "1/2",
                    modules: [{
                        id: "module-1",
                        title: "Distributed foundations",
                        countLabel: "0/2 contents",
                        progressLabel: "Progress for Distributed foundations",
                        completionPercent: 0,
                        isOpen: true,
                        lessons: [{
                            id: "lesson-1",
                            title: "Latency budgets",
                            meta: "12 min",
                            isComplete: false,
                            isCurrent: true,
                        }],
                    }],
                }}
                on={{ openLesson }}
            />,
        )

        const panel = screen.getByRole("navigation", { name: "Course progress" })
        const moduleList = panel.querySelector("[class*=overflow-y-auto]")
        const progress = screen.getByRole("progressbar", { name: "Course progress" })
        const search = screen.getByRole("searchbox", { name: "Search this course" })
        expect(panel).toHaveClass("h-full", "overflow-hidden", "px-3", "py-6")
        expect(panel).not.toHaveClass("p-4")
        expect(moduleList).toHaveClass(
            "divide-y",
            "divide-separator",
            "overflow-y-auto",
            "overscroll-contain",
        )
        expect(moduleList).not.toHaveClass("scrollbar")
        expect(moduleList?.contains(progress)).toBe(false)
        expect(moduleList?.contains(search)).toBe(false)
        expect(progress).toHaveAttribute("aria-valuenow", "50")
        fireEvent.click(screen.getByText("Latency budgets"))
        expect(openLesson).toHaveBeenCalledWith("lesson-1")
    })


    it("rests exactly four authored module shapes while the outline is pending", () => {
        const { container } = render(<CourseContentMapBase state="pending" props={{ labels }} />)
        expect(container.querySelectorAll("[data-loading='true']").length).toBeGreaterThan(0)
    })

    it("keeps the panel and search available for an empty filtered result", () => {
        const search = vi.fn()
        render(<CourseContentMapBase state="empty" props={{ labels, modules: [] }} on={{ search }} />)
        fireEvent.change(screen.getByRole("searchbox", { name: "Search this course" }), { target: { value: "queues" } })
        fireEvent.submit(screen.getByRole("search"))
        expect(search).toHaveBeenCalledWith("queues")
    })

    it("exports the same panel for sticky rails and narrow drawers", () => {
        render(<CourseContentMapPanel state="empty" props={{ labels, modules: [] }} />)
        expect(screen.getAllByRole("navigation", { name: "Course progress" })).toHaveLength(1)
        expect(screen.getByRole("searchbox", { name: "Search this course" })).toBeInTheDocument()
    })
})

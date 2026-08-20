import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseContentMapBase, type CourseContentMapLabels } from "./component"

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
        const { container } = render(
            <CourseContentMapBase
                state="ready"
                props={{
                    labels,
                    completionPercent: 50,
                    progressFact: "1/2",
                    modules: [{
                        id: "module-1",
                        title: "Distributed foundations",
                        countLabel: "2 contents",
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

        expect(container.querySelector("[data-node=content-map-panel]")).toBeTruthy()
        expect(screen.getByRole("progressbar", { name: "Course progress" })).toHaveAttribute("aria-valuenow", "50")
        fireEvent.click(screen.getByText("Latency budgets"))
        expect(openLesson).toHaveBeenCalledWith("lesson-1")
    })

    it("rests exactly four authored module shapes while the outline is pending", () => {
        const { container } = render(<CourseContentMapBase state="pending" props={{ labels }} />)
        expect(container.querySelectorAll("[data-node=content-map-module]")).toHaveLength(4)
    })

    it("keeps the panel and search available for an empty filtered result", () => {
        const search = vi.fn()
        render(<CourseContentMapBase state="empty" props={{ labels, modules: [] }} on={{ search }} />)
        fireEvent.change(screen.getByRole("searchbox", { name: "Search this course" }), { target: { value: "queues" } })
        fireEvent.submit(screen.getByRole("search"))
        expect(search).toHaveBeenCalledWith("queues")
    })
})

/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { MyCoursesProgress } from "@/components/blocks/dashboard/MyCoursesProgress"

/**
 * What these tests guard: the one distinction nothing downstream can make - a list
 * that is empty because the learner has enrolled in nothing, versus a list that is
 * empty because the request has not come back. Plus the clamp, because a percentage
 * from the server is not a promise about the range.
 */

const leaves = vi.hoisted(() => ({
    courses: {} as Record<string, unknown>,
}))

vi.mock("@/hooks", () => ({
    useQueryMyCoursesSwr: () => leaves.courses,
}))

/** Two settled courses. */
const enrolled = [
    { globalId: "course-1", label: "System Design", completionPercent: 40 },
    { globalId: "course-2", label: "Full Stack", completionPercent: 75 },
]

/** The `data-state` the list is currently reporting. */
const listState = (container: HTMLElement): string | null =>
    container.querySelector("[data-part='courses']")?.getAttribute("data-state") ?? null

beforeEach(() => {
    leaves.courses = { isLoading: true }
})

afterEach(() => {
    cleanup()
})

describe("MyCoursesProgress", () => {
    it("rests while the first request is in flight", () => {
        const { container } = render(<MyCoursesProgress />)
        expect(listState(container)).toBe("loading")
        expect(container.querySelectorAll("[data-node='stat']").length).toBe(2)
    })

    it("renders one row per enrolled course once settled", () => {
        leaves.courses = { isLoading: false, data: enrolled }
        const { container } = render(<MyCoursesProgress />)
        expect(listState(container)).toBe("ready")
        expect([...container.querySelectorAll("[data-part='title']")].map((node) => node.textContent))
            .toEqual(["System Design", "Full Stack"])
    })

    it("counts the courses on the heading baseline", () => {
        leaves.courses = { isLoading: false, data: enrolled }
        const { container } = render(<MyCoursesProgress />)
        expect(container.querySelector("[data-part='count']")?.textContent).toBe("2 courses")
    })

    it("counts a single course in the singular", () => {
        leaves.courses = { isLoading: false, data: [enrolled[0]] }
        const { container } = render(<MyCoursesProgress />)
        expect(container.querySelector("[data-part='count']")?.textContent).toBe("1 course")
    })

    it("reads the completion figure into the bar and the text", () => {
        leaves.courses = { isLoading: false, data: enrolled }
        const { container } = render(<MyCoursesProgress />)
        expect([...container.querySelectorAll("progress")].map((bar) => bar.value)).toEqual([40, 75])
        expect([...container.querySelectorAll("[data-part='percent']")].map((node) => node.textContent))
            .toEqual(["40%", "75%"])
    })

    it("clamps a figure the server had no business sending", () => {
        leaves.courses = {
            isLoading: false,
            data: [
                { globalId: "over", label: "Over", completionPercent: 140 },
                { globalId: "under", label: "Under", completionPercent: -12 },
            ],
        }
        const { container } = render(<MyCoursesProgress />)
        expect([...container.querySelectorAll("progress")].map((bar) => bar.value)).toEqual([100, 0])
    })

    it("says nothing is enrolled only once the request has settled", () => {
        leaves.courses = { isLoading: false, data: [] }
        const { container } = render(<MyCoursesProgress />)
        expect(listState(container)).toBe("empty")
    })

    it("treats a settled request with no payload as empty, not as loading", () => {
        leaves.courses = { isLoading: false }
        const { container } = render(<MyCoursesProgress />)
        expect(listState(container)).toBe("empty")
    })
})

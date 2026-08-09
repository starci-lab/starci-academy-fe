/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { MyCoursesProgress } from "@/components/blocks/dashboard/MyCoursesProgress"

/**
 * What these tests guard: the one distinction nothing downstream can make - a list that is
 * empty because the learner has enrolled in nothing, versus a list that is empty because the
 * request has not come back - plus the third case the first version of this block got wrong: a
 * request that FAILED. SWR retries a rejected key and reports it as loading again on every
 * attempt, so a list that read the flag alone shimmered for as long as the backend was down.
 * Plus the clamp, because a percentage from the server is not a promise about the range.
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

/** Every course card currently on screen. */
const cards = (container: HTMLElement): Array<Element> =>
    [...container.querySelectorAll("[data-node='stat']")]

/** Every progress bar on screen, as the accessibility tree sees it. */
const bars = (container: HTMLElement): Array<Element> =>
    [...container.querySelectorAll("[role='progressbar']")]

/** Whether the region has settled into its designed empty state. */
const isEmptyState = (container: HTMLElement): boolean =>
    container.querySelector("[data-node='empty-state']") !== null

beforeEach(() => {
    leaves.courses = { isLoading: true }
})

afterEach(() => {
    cleanup()
})

describe("MyCoursesProgress", () => {
    it("rests while the first request is in flight", () => {
        const { container } = render(<MyCoursesProgress />)
        expect(cards(container).length).toBe(2)
        expect(isEmptyState(container)).toBe(false)
    })

    it("renders one card per enrolled course once settled", () => {
        leaves.courses = { isLoading: false, data: enrolled }
        const { container } = render(<MyCoursesProgress />)
        expect(cards(container).map((card) => card.children[0].textContent))
            .toEqual(["System Design", "Full Stack"])
    })

    it("counts the courses on the heading baseline", () => {
        leaves.courses = { isLoading: false, data: enrolled }
        const { container } = render(<MyCoursesProgress />)
        expect(container.querySelector("[data-node='section-header']")?.children[1].textContent)
            .toBe("2 courses")
    })

    it("counts a single course in the singular", () => {
        leaves.courses = { isLoading: false, data: [enrolled[0]] }
        const { container } = render(<MyCoursesProgress />)
        expect(container.querySelector("[data-node='section-header']")?.children[1].textContent)
            .toBe("1 course")
    })

    it("reads the completion figure into the bar and the badge", () => {
        leaves.courses = { isLoading: false, data: enrolled }
        const { container } = render(<MyCoursesProgress />)
        expect(bars(container).map((bar) => bar.getAttribute("aria-valuenow"))).toEqual(["40", "75"])
        expect([...container.querySelectorAll("[data-component='Badge']")].map((node) => node.textContent))
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
        expect(bars(container).map((bar) => bar.getAttribute("aria-valuenow"))).toEqual(["100", "0"])
    })

    it("says nothing is enrolled only once the request has settled", () => {
        leaves.courses = { isLoading: false, data: [] }
        const { container } = render(<MyCoursesProgress />)
        expect(isEmptyState(container)).toBe(true)
    })

    it("treats a settled request with no payload as empty, not as loading", () => {
        leaves.courses = { isLoading: false }
        const { container } = render(<MyCoursesProgress />)
        expect(isEmptyState(container)).toBe(true)
    })

    it("settles a FAILED request into the empty state rather than resting on its retry", () => {
        leaves.courses = { isLoading: true, error: new Error("unreachable") }
        const { container } = render(<MyCoursesProgress />)
        expect(isEmptyState(container)).toBe(true)
        expect(cards(container).length).toBe(0)
    })
})

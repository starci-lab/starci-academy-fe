/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import {
    _MyCoursesProgress,
    type MyCoursesProgressCourse,
    type MyCoursesProgressLabels,
} from "@/components/blocks/dashboard/MyCoursesProgress/component"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that the count sits inside the header tree rather than beside it,
 * that a resting card is the same `stat` tree a loaded card is, and that the three states are
 * mutually exclusive - a resting list must never also claim to be empty, which is the failure
 * that shows an enrolled learner an empty message. The empty branch is a DESIGNED state with a
 * way out, not a sentence: a region that settled with nothing still owes the reader an action.
 */

const labels: MyCoursesProgressLabels = {
    heading: "My courses",
    count: "2 courses",
    loading: "Loading",
    empty: "You have not enrolled in a course yet",
    retry: "Check again",
}

const courses: ReadonlyArray<MyCoursesProgressCourse> = [
    { id: "course-1", title: "System Design", percent: 40, percentText: "40%" },
    { id: "course-2", title: "Full Stack", percent: 75, percentText: "75%" },
]

/** Every course card currently on screen. */
const cards = (container: HTMLElement): Array<Element> =>
    [...container.querySelectorAll("[data-node='stat']")]

/** Every progress bar on screen, as the accessibility tree sees it. */
const bars = (container: HTMLElement): Array<Element> =>
    [...container.querySelectorAll("[role='progressbar']")]

afterEach(() => {
    cleanup()
})

describe("_MyCoursesProgress", () => {
    it("draws a bounded surface whose heading carries the count on its baseline", () => {
        const { container } = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        // The region is a card with no closing row, which is a different tree from `card` -
        // not a variant of it: every role a key declares is required, so a footer nobody has
        // would have to be invented.
        expect(container.firstElementChild?.getAttribute("data-node")).toBe("surface-card")
        const header = container.querySelector("[data-node='section-header']")
        expect(header?.getAttribute("data-roles")).toBe("heading meta")
    })

    it("wears the registry classes rather than any of its own", () => {
        const { container } = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        expect(container.firstElementChild?.getAttribute("class")).toBe(contractSpec("surface-card").classes)
        expect(container.querySelector("[data-node='section-header']")?.getAttribute("class"))
            .toBe(contractSpec("section-header").classes)
        expect(container.querySelector("[data-node='grid']")?.getAttribute("class")).toBe(contractSpec("grid").classes)
        expect(cards(container)[0].getAttribute("class")).toBe(contractSpec("stat").classes)
    })

    it("puts the count on the heading baseline, inside the header tree", () => {
        const { container } = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        const header = container.querySelector("[data-node='section-header']")
        expect(header?.children[1].textContent).toBe(labels.count)
        expect(header?.querySelector("h3")?.textContent).toBe(labels.heading)
    })

    it("renders one card per course, in order, side by side", () => {
        const { container } = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        expect(container.querySelector("[data-node='grid']")).not.toBeNull()
        expect(cards(container).map((card) => card.children[0].textContent))
            .toEqual(["System Design", "Full Stack"])
    })

    it("gives each card a real progress bar carrying the figure and its name", () => {
        const { container } = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        expect(bars(container).length).toBe(courses.length)
        expect(bars(container).map((bar) => bar.getAttribute("aria-valuenow"))).toEqual(["40", "75"])
        expect(bars(container).map((bar) => bar.getAttribute("aria-label")))
            .toEqual(["System Design", "Full Stack"])
    })

    it("says what the figure MEANS rather than only drawing it", () => {
        const { container } = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        const badges = [...container.querySelectorAll("[data-component='Badge']")]
        expect(badges.map((badge) => badge.textContent)).toEqual(["40%", "75%"])
        expect(badges.map((badge) => badge.getAttribute("data-tone"))).toEqual(["accent", "accent"])
    })

    it("rests as the same tree, with the same cards", () => {
        const { container } = render(<_MyCoursesProgress isLoading isEmpty courses={[]} labels={labels} />)
        expect(cards(container).length).toBe(2)
        expect(container.querySelector("[data-node='empty-state']")).toBeNull()
        expect(container.querySelector("[data-node='section-header']")?.children[1]
            .getAttribute("data-loading")).toBe("true")
    })

    it("says nothing is enrolled only once the request has settled, and offers a way out", () => {
        const onRetry = vi.fn()
        const { container } = render(
            <_MyCoursesProgress isEmpty courses={[]} labels={labels} onRetry={onRetry} />,
        )
        const empty = container.querySelector("[data-node='empty-state']")
        expect(empty?.getAttribute("data-roles")).toBe("media heading action")
        expect(empty?.querySelector("h3")?.textContent).toBe(labels.empty)
        expect(cards(container).length).toBe(0)

        const retry = container.querySelector("button")
        expect(retry?.textContent).toContain(labels.retry)
        fireEvent.click(retry as HTMLButtonElement)
        expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it("keeps the heading in every state", () => {
        const resting = render(<_MyCoursesProgress isLoading courses={[]} labels={labels} />)
        expect(resting.container.querySelector("h3")?.textContent).toBe(labels.heading)
        cleanup()

        const empty = render(<_MyCoursesProgress isEmpty courses={[]} labels={labels} />)
        expect(empty.container.querySelector("h3")?.textContent).toBe(labels.heading)
        cleanup()

        const loaded = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        expect(loaded.container.querySelector("h3")?.textContent).toBe(labels.heading)
    })
})

/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import {
    _MyCoursesProgress,
    type MyCoursesProgressCourse,
    type MyCoursesProgressLabels,
} from "@/components/blocks/dashboard/MyCoursesProgress/component"
import { treeSpec } from "@/components/classNames"

/**
 * What these tests guard: that the count sits inside the header tree rather than
 * beside it, that a resting row is the same `stat` tree a loaded row is, and that the
 * three states are mutually exclusive - a resting list must never also claim to be
 * empty, which is the failure that shows an enrolled learner an empty message.
 */

const labels: MyCoursesProgressLabels = {
    heading: "My courses",
    count: "2 courses",
    loading: "Loading",
    empty: "You have not enrolled in a course yet",
}

const courses: ReadonlyArray<MyCoursesProgressCourse> = [
    { id: "course-1", title: "System Design", percent: 40, percentText: "40%" },
    { id: "course-2", title: "Full Stack", percent: 75, percentText: "75%" },
]

/** The `data-state` the list is currently reporting. */
const listState = (container: HTMLElement): string | null =>
    container.querySelector("[data-part='courses']")?.getAttribute("data-state") ?? null

afterEach(() => {
    cleanup()
})

describe("_MyCoursesProgress", () => {
    it("draws a section whose heading is a section-header tree", () => {
        const { container } = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        expect(container.firstElementChild?.getAttribute("data-node")).toBe("section")
        const header = container.querySelector("[data-node='section-header']")
        expect(header?.getAttribute("data-roles")).toBe("heading meta")
    })

    it("wears the registry classes rather than any of its own", () => {
        const { container } = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        expect(container.firstElementChild?.getAttribute("class")).toBe(treeSpec("section").classes)
        expect(container.querySelector("[data-node='section-header']")?.getAttribute("class"))
            .toBe(treeSpec("section-header").classes)
        expect(container.querySelector("[data-node='stat']")?.getAttribute("class")).toBe(treeSpec("stat").classes)
    })

    it("puts the count on the heading baseline, inside the header tree", () => {
        const { container } = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        const header = container.querySelector("[data-node='section-header']")
        expect(header?.querySelector("[data-part='count']")?.textContent).toBe(labels.count)
        expect(header?.querySelector("h2")?.textContent).toBe(labels.heading)
    })

    it("renders one stat tree per course, in order", () => {
        const { container } = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        expect(listState(container)).toBe("ready")
        expect([...container.querySelectorAll("[data-part='title']")].map((node) => node.textContent))
            .toEqual(["System Design", "Full Stack"])
        expect([...container.querySelectorAll("[data-part='percent']")].map((node) => node.textContent))
            .toEqual(["40%", "75%"])
    })

    it("gives each row a real progress element carrying the figure", () => {
        const { container } = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        const bars = [...container.querySelectorAll("progress")]
        expect(bars.length).toBe(courses.length)
        expect(bars.map((bar) => bar.value)).toEqual([40, 75])
        expect(bars.map((bar) => bar.getAttribute("aria-label"))).toEqual(["System Design", "Full Stack"])
    })

    it("rests as the same tree, with the same stat rows", () => {
        const { container } = render(<_MyCoursesProgress isLoading isEmpty courses={[]} labels={labels} />)
        expect(listState(container)).toBe("loading")
        expect(container.querySelectorAll("[data-node='stat']").length).toBe(2)
        expect(container.querySelector("[data-part='count']")?.getAttribute("data-state")).toBe("loading")
    })

    it("says nothing is enrolled only once the request has settled", () => {
        const { container } = render(<_MyCoursesProgress isEmpty courses={[]} labels={labels} />)
        expect(listState(container)).toBe("empty")
        expect(container.querySelector("[data-part='courses']")?.textContent).toBe(labels.empty)
        expect(container.querySelectorAll("[data-node='stat']").length).toBe(0)
    })

    it("keeps the heading in every state", () => {
        const resting = render(<_MyCoursesProgress isLoading courses={[]} labels={labels} />)
        expect(resting.container.querySelector("h2")?.textContent).toBe(labels.heading)
        cleanup()

        const empty = render(<_MyCoursesProgress isEmpty courses={[]} labels={labels} />)
        expect(empty.container.querySelector("h2")?.textContent).toBe(labels.heading)
        cleanup()

        const loaded = render(<_MyCoursesProgress courses={courses} labels={labels} />)
        expect(loaded.container.querySelector("h2")?.textContent).toBe(labels.heading)
    })
})

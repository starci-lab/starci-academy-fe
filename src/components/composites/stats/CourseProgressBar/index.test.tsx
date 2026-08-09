/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import {
    CourseProgressBar,
    meta,
    type CourseProgressBarProps,
} from "@/components/composites/stats/CourseProgressBar"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that the figure is said ONCE on screen and once to assistive
 * technology, and that its tone is derived rather than passed. A caller who could choose the
 * tone could mark a half-finished course as done, which is the one thing a progress card must
 * never be able to do.
 */

/**
 * The copy this card is exercised with, hoisted the way every twin test in this tree supplies
 * resolved copy - a composite takes translated text as a prop and never spells its own.
 */
const copy = {
    /** The course being drawn. */
    title: "System Design",
    /** A second course, for the test that proves two bars tell each other apart. */
    other: "Full Stack",
}

/** Render with the given props and hand back the card. */
const renderCard = (props: Partial<CourseProgressBarProps> = {}): Element => {
    const merged: CourseProgressBarProps = {
        title: copy.title,
        percent: 40,
        percentText: "40%",
        ...props,
    }
    const { container } = render(<CourseProgressBar {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("CourseProgressBar rendered nothing")
    return root
}

/** The badge the card shows, if any. */
const badge = (root: Element): Element | null => root.querySelector("[data-component='Badge']")

afterEach(() => {
    cleanup()
})

describe("CourseProgressBar", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "composite", name: "CourseProgressBar" })
    })

    it("draws the registry key, and wears its classes rather than any of its own", () => {
        const root = renderCard()
        expect(root.getAttribute("data-node")).toBe("stat")
        expect(root.getAttribute("class")).toBe(contractSpec("stat").classes)
    })

    it("reads the title before the figure, on a line of its own", () => {
        const root = renderCard()
        expect(root.children[0].textContent).toBe(copy.title)
    })

    it("announces the figure once, and shows it once", () => {
        const root = renderCard({ percent: 40, percentText: "40%" })
        expect(root.querySelector("[role='progressbar']")?.getAttribute("aria-valuenow")).toBe("40")
        expect(root.querySelector("[role='progressbar']")?.textContent).toBe("")
        expect(badge(root)?.textContent).toBe("40%")
    })

    it("names the bar with the course, so two cards tell each other apart", () => {
        expect(renderCard({ title: copy.other }).querySelector("[role='progressbar']")
            ?.getAttribute("aria-label")).toBe(copy.other)
    })

    it("derives what the figure MEANS rather than letting a caller claim it", () => {
        expect(badge(renderCard({ percent: 100 }))?.getAttribute("data-tone")).toBe("success")
        cleanup()
        expect(badge(renderCard({ percent: 40 }))?.getAttribute("data-tone")).toBe("accent")
        cleanup()
        expect(badge(renderCard({ percent: 0 }))?.getAttribute("data-tone")).toBe("neutral")
    })

    it("rests as the same card, with no figure to read", () => {
        const root = renderCard({ isLoading: true })
        expect(root.getAttribute("data-node")).toBe("stat")
        expect(badge(root)).toBeNull()
        expect(root.querySelector("[role='progressbar']")?.getAttribute("data-loading")).toBe("true")
    })

    it("offers no className or tone door", () => {
        const backDoor = { className: "back-door", tone: "danger" } as unknown as CourseProgressBarProps
        const { container } = render(
            <CourseProgressBar {...backDoor} title={copy.title} percent={40} percentText="40%" />,
        )
        const root = container.firstElementChild
        expect(root?.getAttribute("class")).toBe(contractSpec("stat").classes)
        expect(root?.querySelector("[data-component='Badge']")?.getAttribute("data-tone")).toBe("accent")
    })
})

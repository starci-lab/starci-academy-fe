/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import {
    StatGridCard,
    meta,
    type StatGridCardItem,
    type StatGridCardProps,
} from "@/components/composites/stats/StatGridCard"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that figures about ONE subject are drawn on one surface and rest
 * TOGETHER. They come from one request - that is what makes them one subject - so four cells
 * shimmering independently would be describing four requests this card does not have.
 */

const items: ReadonlyArray<StatGridCardItem> = [
    { label: "Lessons", value: "12" },
    { label: "Minutes", value: "340" },
    { label: "Streak", value: "3", icon: "streak", verdict: "passed" },
]

/** Render with the given props and hand back the card. */
const renderCard = (props: Partial<StatGridCardProps> = {}): Element => {
    const merged: StatGridCardProps = { label: "This week", items, ...props }
    const { container } = render(<StatGridCard {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("StatGridCard rendered nothing")
    return root
}

/** Every figure tile on screen. */
const cells = (root: Element): Array<Element> => [...root.querySelectorAll("[data-node='stat']")]

afterEach(() => {
    cleanup()
})

describe("StatGridCard", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "composite", name: "StatGridCard" })
    })

    it("draws one bounded surface holding a grid, not one card per figure", () => {
        const root = renderCard()
        expect(root.getAttribute("data-node")).toBe("surface-card")
        expect(root.querySelector("[data-node='grid']")?.getAttribute("class"))
            .toBe(contractSpec("grid").classes)
    })

    it("titles the subject once, above every figure about it", () => {
        expect(renderCard().querySelector("h3")?.textContent).toBe("This week")
    })

    it("renders one cell per figure, in order", () => {
        expect(cells(renderCard()).map((cell) => cell.children[0].textContent))
            .toEqual(["Lessons", "Minutes", "Streak"])
    })

    it("carries a verdict through to the cell that has one, and only to that cell", () => {
        const badges = [...renderCard().querySelectorAll("[data-component='Badge']")]
        expect(badges.length).toBe(1)
        expect(badges[0].getAttribute("data-tone")).toBe("success")
    })

    it("puts a supporting fact on the title's baseline when it is given one", () => {
        const header = renderCard({ meta: "7 days" }).querySelector("[data-node='section-header']")
        expect(header?.children[1].textContent).toBe("7 days")
    })

    it("rests every cell together, because every figure came from one request", () => {
        const resting = cells(renderCard({ isLoading: true }))
            .map((cell) => cell.children[1].getAttribute("data-loading"))
        expect(resting).toEqual(["true", "true", "true"])
    })

    it("offers no className door", () => {
        const backDoor = { className: "back-door" } as unknown as StatGridCardProps
        const { container } = render(<StatGridCard {...backDoor} label="This week" items={items} />)
        expect(container.firstElementChild?.getAttribute("class")).toBe(contractSpec("surface-card").classes)
    })
})

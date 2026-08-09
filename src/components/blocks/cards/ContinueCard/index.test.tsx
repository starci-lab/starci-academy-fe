/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { ContinueCard, meta, type ContinueCardProps } from "@/components/blocks/cards/ContinueCard"

/**
 * What these tests guard: that the variant decides the EMPHASIS of the way on and nothing else -
 * so a surface holding several of these still has one primary - and that no meter is drawn when
 * nobody measured. A card that shows nought per cent because the figure was absent is inventing
 * a number, which is worse than showing none.
 */

/** Render with the given props and hand back the root node. */
const renderCard = (props: Partial<ContinueCardProps> = {}): Element => {
    const merged: ContinueCardProps = {
        variant: "item",
        title: "Systems Design",
        ctaLabel: "Continue",
        href: "/courses/systems-design",
        ...props,
    }
    const { container } = render(<ContinueCard {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("ContinueCard rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("ContinueCard", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "ContinueCard" })
    })

    it("closes the card with the way on rather than hiding it in the body", () => {
        const root = renderCard()
        expect(root.getAttribute("data-node")).toBe("card")
        expect(root.getAttribute("data-roles")).toBe("heading body footer")
        const link = root.querySelector("a")
        expect(link?.getAttribute("href")).toBe("/courses/systems-design")
        expect(link?.textContent).toContain("Continue")
    })

    it("makes the standout the primary and leaves one of several quiet", () => {
        const hero = renderCard({ variant: "hero" })
        expect(hero.querySelector("a")?.getAttribute("data-emphasis")).toBe("primary")
        cleanup()
        const item = renderCard({ variant: "item" })
        expect(item.querySelector("a")?.getAttribute("data-emphasis")).toBe("default")
    })

    it("draws no meter when nobody measured", () => {
        const root = renderCard()
        expect(root.querySelector("[role='progressbar']")).toBeNull()
    })

    it("draws the meter, and says what the figure MEANS, when there is one", () => {
        const root = renderCard({ percent: 40, percentText: "40%", percentLabel: "Course progress" })
        const bar = root.querySelector("[role='progressbar']")
        expect(bar?.getAttribute("aria-valuenow")).toBe("40")
        expect(root.textContent).toContain("40%")
    })

    it("keeps the name of the thing being resumed while the rest of the card rests", () => {
        const root = renderCard({ subtitle: "Module 3", isLoading: true })
        expect(root.querySelector("h3")?.textContent).toBe("Systems Design")
        expect(root.querySelector("[data-component='IconTile']")?.getAttribute("data-loading")).toBe("true")
    })
})

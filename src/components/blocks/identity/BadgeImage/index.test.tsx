/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { BadgeImage, meta, type BadgeImageProps } from "@/components/blocks/identity/BadgeImage"

/**
 * What these tests guard: that art which has not been drawn yet degrades to something designed
 * rather than to a torn-image glyph, and that one badge's absence is not inherited by the next.
 * Both are only reachable through a load FAILURE, which is why the test fires one.
 */

/** What stands in when there is no artwork. */
const Fallback = () => <span data-testid="fallback">no art</span>

/** Render with the given props. */
const renderBadge = (props: Partial<BadgeImageProps> = {}) => {
    const merged: BadgeImageProps = {
        src: "/badges/gold.png",
        alt: "Gold league",
        fallback: Fallback,
        ...props,
    }
    return render(<BadgeImage {...merged} />)
}

afterEach(() => {
    cleanup()
})

describe("BadgeImage", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "BadgeImage" })
    })

    it("draws the artwork, carrying what the badge IS as its alternative text", () => {
        const { container } = renderBadge()
        const image = container.querySelector("img")
        expect(image?.getAttribute("src")).toBe("/badges/gold.png")
        expect(image?.getAttribute("alt")).toBe("Gold league")
    })

    it("falls back to what the caller designed once the object answers with an error", () => {
        const { container } = renderBadge()
        fireEvent.error(container.querySelector("img") as HTMLImageElement)
        expect(container.querySelector("img")).toBeNull()
        expect(container.querySelector("[data-testid='fallback']")).not.toBeNull()
    })

    it("stops inheriting one badge's absence when the address changes", () => {
        const { container, rerender } = renderBadge()
        fireEvent.error(container.querySelector("img") as HTMLImageElement)
        rerender(<BadgeImage src="/badges/silver.png" alt="Silver league" fallback={Fallback} />)
        expect(container.querySelector("img")?.getAttribute("src")).toBe("/badges/silver.png")
    })

    it("rests through the fallback rather than through a half-drawn picture", () => {
        const { container } = renderBadge({ isLoading: true })
        expect(container.querySelector("img")).toBeNull()
        expect(container.querySelector("[data-testid='fallback']")).not.toBeNull()
    })
})

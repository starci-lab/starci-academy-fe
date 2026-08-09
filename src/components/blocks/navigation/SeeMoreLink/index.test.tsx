/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { SeeMoreLink, meta } from "@/components/blocks/navigation/SeeMoreLink"

/**
 * What these tests guard: that this is an ADDRESS. The original could also be a handler, or
 * inert markup; both of those take away the three things a reader gets for free from a real
 * link - a new tab, a copied URL, and knowing where it goes before pressing it.
 */

afterEach(() => {
    cleanup()
})

describe("SeeMoreLink", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "SeeMoreLink" })
    })

    it("is a real address carrying its own words", () => {
        const { container } = render(<SeeMoreLink label="See all courses" href="/courses" />)
        const link = container.querySelector("a")
        expect(link?.getAttribute("href")).toBe("/courses")
        expect(link?.textContent).toContain("See all courses")
    })

    it("carries the glyph that makes the words read as a way onward", () => {
        const { container } = render(<SeeMoreLink label="See all courses" href="/courses" />)
        expect(container.querySelector("a svg")).not.toBeNull()
    })
})

/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { PriceTag, meta } from "@/components/blocks/commerce/PriceTag"

/**
 * What these tests guard: that no former price appears unless one was given. A struck-through
 * figure is a persuasion device, and a component that produced one from a default would be
 * inventing the discount rather than reporting it.
 */

afterEach(() => {
    cleanup()
})

describe("PriceTag", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "PriceTag" })
    })

    it("says one figure, and strikes nothing, when there is no discount", () => {
        const { container } = render(<PriceTag price="1,990,000 VND" />)
        expect(container.textContent).toBe("1,990,000 VND")
        expect(container.querySelector("del")).toBeNull()
    })

    it("marks the former price as content that has been removed, not merely as a struck style", () => {
        const { container } = render(<PriceTag price="1,390,000 VND" listPrice="1,990,000 VND" />)
        expect(container.querySelector("del")?.textContent).toBe("1,990,000 VND")
        const line = container.querySelector("[data-node='key-value-row']")
        expect(line?.children[0].textContent).toBe("1,390,000 VND")
    })

    it("says the price more loudly where the price IS the thing being read", () => {
        const { container } = render(<PriceTag price="1,990,000 VND" emphasis="prominent" />)
        expect(container.querySelector("[data-component='Text']")?.getAttribute("data-size")).toBe("md")
        cleanup()
        const inline = render(<PriceTag price="1,990,000 VND" emphasis="inline" />)
        expect(inline.container.querySelector("[data-component='Text']")?.getAttribute("data-size")).toBe("sm")
    })

    it("rests both figures as themselves", () => {
        const { container } = render(<PriceTag price="1,390,000 VND" listPrice="1,990,000 VND" isLoading />)
        const texts = container.querySelectorAll("[data-component='Text']")
        expect([...texts].map((node) => node.getAttribute("data-loading"))).toEqual(["true", "true"])
    })
})

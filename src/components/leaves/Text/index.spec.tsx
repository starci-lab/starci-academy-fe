/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { Text } from "./index"

afterEach(cleanup)

describe("Text", () => {
    it("reserves xs for supporting captions below an ordinary sm label", () => {
        const { container } = render(<Text props={{ content: "Supporting caption", size: "xs", tone: "muted" }} />)
        const line = container.querySelector("div")

        expect(line).toHaveAttribute("data-size", "xs")
        expect(line).toHaveClass("data-[size=xs]:text-xs", "data-[size=xs]:leading-4")
    })

    it("keeps a visible line box while resting without resolved copy", () => {
        const { container } = render(<Text props={{ size: "sm" }} isLoading />)
        const line = container.querySelector("div")

        expect(line).toHaveAttribute("data-loading", "true")
        expect(line).toHaveClass("w-12", "leading-5")
        expect(line?.textContent).toBe("\u00a0")
    })

    it("keeps the smaller caption measure while resting", () => {
        const { container } = render(<Text props={{ size: "xs" }} isLoading />)
        const line = container.querySelector("div")

        expect(line).toHaveClass("w-10", "text-xs", "leading-4")
    })

    it("responds to parent selection without overriding the vendor hover colour", () => {
        const { container } = render(<Text props={{ content: "Count", size: "xs", parentEmphasis: "accent-soft" }} />)
        const line = container.querySelector("div")
        expect(line).toHaveAttribute("data-parent-emphasis", "accent-soft")
        expect(line).toHaveClass("data-[parent-emphasis=accent-soft]:group-data-[selected=true]:text-accent-soft-foreground")
        expect(line?.className).not.toContain("group-hover:text-accent-soft")
    })
})

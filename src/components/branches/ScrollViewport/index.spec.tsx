import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ScrollViewport } from "."

describe("ScrollViewport", () => {
    it("uses HeroUI ScrollShadow with the Grammar-owned form viewport", () => {
        const label = ["Sign", "in"].join(" ")
        const { container } = render(<ScrollViewport boundary="form-surface"><form aria-label={label} /></ScrollViewport>)
        expect(container.firstElementChild).toHaveClass("starci-core-form-scroll-viewport")
        expect(container.firstElementChild).toHaveClass("scroll-shadow", "scroll-shadow--vertical")
        expect(container.firstElementChild).toHaveClass("scroll-shadow--hide-scrollbar")
        expect(container.firstElementChild).toHaveAttribute("data-orientation", "vertical")
        expect(container.firstElementChild).not.toHaveClass("overflow-y-auto", "max-w-lg")
        expect(screen.getByRole("form", { name: label })).toBeInTheDocument()
    })
    it("passes non-pricing regions through", () => {
        render(<ScrollViewport boundary="content-reader-main"><article>Reader</article></ScrollViewport>)
        expect(screen.getByRole("article")).toHaveTextContent("Reader")
    })
    it("reuses the vertical ScrollShadow inside the pricing surface", () => {
        const { container } = render(<ScrollViewport boundary="pricing-rail"><div>Pricing</div></ScrollViewport>)
        expect(screen.getByText("Pricing")).toBeInTheDocument()
        const scroll = container.querySelector("[data-orientation=\"vertical\"]")
        expect(scroll).toHaveClass("scroll-shadow", "scroll-shadow--vertical", "overscroll-contain")
    })
    it("owns one bounded course-navigation viewport below the fixed rail chrome", () => {
        const content = ["Home", "and", "destinations"].join(" ")
        const { container } = render(<ScrollViewport boundary="learn-navigation-groups"><div>{content}</div></ScrollViewport>)
        const scroll = container.querySelector("[data-orientation=\"vertical\"]")
        expect(scroll).toHaveAttribute("data-learn-navigation-scroll", "true")
        expect(scroll).toHaveClass("scroll-shadow", "scroll-shadow--vertical", "scroll-shadow--hide-scrollbar", "h-0", "min-h-0", "max-h-full", "flex-1", "overflow-y-auto", "overscroll-contain", "touch-pan-y")
        expect(scroll).toHaveTextContent(content)
    })
})

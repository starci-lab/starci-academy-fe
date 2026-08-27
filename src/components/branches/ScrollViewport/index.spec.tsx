import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ScrollViewport } from "."

describe("ScrollViewport", () => {
    it("passes non-pricing regions through", () => {
        render(<ScrollViewport boundary="content-reader-main"><article>Reader</article></ScrollViewport>)
        expect(screen.getByRole("article")).toHaveTextContent("Reader")
    })
    it("keeps the pricing rail inside a surface", () => {
        render(<ScrollViewport boundary="pricing-rail"><div>Pricing</div></ScrollViewport>)
        expect(screen.getByText("Pricing")).toBeInTheDocument()
    })
})

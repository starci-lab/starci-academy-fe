import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Icon } from "./index"

describe("Icon", () => {
    it("draws the distinct StarCi AI conversation-and-code mark", () => {
        const { container } = render(<Icon props={{ name: "aiChatbot", role: "heading" }} />)
        const glyph = container.querySelector("svg")
        expect(glyph).toBeInTheDocument()
        expect(glyph).toHaveClass("size-6")
        expect(glyph?.querySelectorAll("path")).toHaveLength(3)
    })
})

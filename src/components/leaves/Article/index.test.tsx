import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Article } from "./index"

describe("Article", () => {
    it("opts a grounded article into the shared AI selection boundary", () => {
        const { container } = render(<Article props={{ body: "Lesson body", aiSelectable: true }} />)
        expect(container.firstElementChild).toHaveAttribute("data-ai-selectable", "true")
    })

    it("leaves ordinary article call sites outside AI selection by default", () => {
        const { container } = render(<Article props={{ body: "Lesson body" }} />)
        expect(container.firstElementChild).not.toHaveAttribute("data-ai-selectable")
    })
})


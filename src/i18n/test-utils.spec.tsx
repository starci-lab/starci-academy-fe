import { describe, expect, it } from "vitest"
import { renderWithIntl } from "./test-utils"

describe("renderWithIntl", () => {
    it("renders a node with the shared message provider", () => {
        const view = renderWithIntl(<span>test content</span>)
        expect(view.getByText("test content")).toBeInTheDocument()
        view.unmount()
    })
})

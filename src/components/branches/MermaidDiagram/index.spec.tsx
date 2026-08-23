import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { MermaidDiagram } from "."

vi.mock("mermaid", () => ({
    default: {
        initialize: vi.fn(),
        render: vi.fn().mockResolvedValue({ svg: "<svg><text>CatModule</text></svg>" }),
    },
}))

describe("MermaidDiagram", () => {
    it("turns a mermaid fence into an accessible SVG figure", async () => {
        const { container } = render(<MermaidDiagram props={{ source: "flowchart LR; A-->B", label: "Module flow" }} />)
        expect(screen.getByLabelText("Module flow")).toBeInTheDocument()
        await waitFor(() => expect(container.querySelector("svg")?.textContent).toBe("CatModule"))
    })
})

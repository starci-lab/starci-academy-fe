import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _StarCiAiSelectionAsk } from "./component"

describe("_StarCiAiSelectionAsk", () => {
    it("renders exact selected code and keeps append/tangent mutually explicit", () => {
        const append = vi.fn()
        const tangent = vi.fn()
        render(
            <_StarCiAiSelectionAsk
                state="ready"
                props={{
                    selection: { kind: "code", quote: "controller.abort()", path: "src/useTodos.ts" },
                    appendLabel: "Ask in this chat",
                    tangentLabel: "Start tangent",
                    dismissLabel: "Dismiss",
                    position: { x: 20, y: 40 },
                }}
                on={{ append, tangent }}
            />,
        )
        expect(screen.getByText("controller.abort()")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Ask in this chat" }))
        fireEvent.click(screen.getByRole("button", { name: "Start tangent" }))
        expect(append).toHaveBeenCalledTimes(1)
        expect(tangent).toHaveBeenCalledTimes(1)
    })

    it("renders nothing when no valid selection exists", () => {
        const { container } = render(<_StarCiAiSelectionAsk state="hidden" />)
        expect(container).toBeEmptyDOMElement()
    })
})

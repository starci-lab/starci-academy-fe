import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { StarCiAiSelectionAskBase } from "./component"

describe("StarCiAiSelectionAskBase", () => {
    it("renders exact selected code and keeps append/tangent mutually explicit", () => {
        const append = vi.fn()
        const tangent = vi.fn()
        render(
            <StarCiAiSelectionAskBase
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

    it("labels a code quote with the language its own file extension names", () => {
        const { container } = render(
            <StarCiAiSelectionAskBase
                state="ready"
                props={{
                    selection: { kind: "code", quote: "controller.abort()", path: "src/useTodos.ts" },
                    appendLabel: "Ask in this chat",
                    tangentLabel: "Start tangent",
                    dismissLabel: "Dismiss",
                    position: { x: 20, y: 40 },
                }}
            />,
        )
        expect(container.querySelector("pre")?.textContent).toBe("controller.abort()")
    })

    it("names no language for a code quote that came from no file", () => {
        const { container } = render(
            <StarCiAiSelectionAskBase
                state="ready"
                props={{
                    selection: { kind: "code", quote: "controller.abort()" },
                    appendLabel: "Ask in this chat",
                    tangentLabel: "Start tangent",
                    dismissLabel: "Dismiss",
                    position: { x: 20, y: 40 },
                }}
            />,
        )
        expect(container.querySelector("pre")?.textContent).toBe("controller.abort()")
    })

    it("names no language for a prose quote, whatever file the reader was on", () => {
        const { container } = render(
            <StarCiAiSelectionAskBase
                state="ready"
                props={{
                    selection: { kind: "prose", quote: "A promise settles once.", path: "lesson.md" },
                    appendLabel: "Ask in this chat",
                    tangentLabel: "Start tangent",
                    dismissLabel: "Dismiss",
                    position: { x: 20, y: 40 },
                }}
            />,
        )
        expect(container.querySelector("pre")?.textContent).toBe("A promise settles once.")
    })

    it("dismisses the surface without asking anything of the chat", () => {
        const append = vi.fn()
        const dismiss = vi.fn()
        render(
            <StarCiAiSelectionAskBase
                state="ready"
                props={{
                    selection: { kind: "prose", quote: "A promise settles once." },
                    appendLabel: "Ask in this chat",
                    tangentLabel: "Start tangent",
                    dismissLabel: "Dismiss",
                    position: { x: 20, y: 40 },
                }}
                on={{ append, dismiss }}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: "Dismiss" }))
        expect(dismiss).toHaveBeenCalledTimes(1)
        expect(append).not.toHaveBeenCalled()
    })

    it("renders nothing when no valid selection exists", () => {
        const { container } = render(<StarCiAiSelectionAskBase state="hidden" />)
        expect(container).toBeEmptyDOMElement()
    })
})

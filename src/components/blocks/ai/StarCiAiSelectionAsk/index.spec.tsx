import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useGlobalAiChat } from "@/modules/ai/global-ai-chat-context"
import { StarCiAiSelectionAsk } from "./index"

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}))

vi.mock("@/modules/ai/global-ai-chat-context", () => ({ useGlobalAiChat: vi.fn() }))

// jsdom implements ranges but not their geometry, and the block asks a range where it is so the
// surface can be placed over it. A fixed rect is the honest stand-in: nothing here has layout.
Range.prototype.getBoundingClientRect = () => ({
    x: 40, y: 100, left: 40, top: 100, right: 140, bottom: 120, width: 100, height: 20,
    toJSON: () => ({}),
} as DOMRect)

const chat = {
    open: vi.fn(),
    close: vi.fn(),
    setCodeContext: vi.fn(),
    startTangent: vi.fn(),
}

vi.mocked(useGlobalAiChat).mockReturnValue(chat as never)

/**
 * One opted-in reading root, mounted beside the listener.
 *
 * The block listens on `document`, so the root it reads has to be in the same document the test
 * selects inside - which is why the fixture is rendered rather than described.
 */
const mountRoot = (dataset: Readonly<Record<string, string>> = {}) => {
    const root = document.createElement("div")
    root.setAttribute("data-ai-selectable", "true")
    for (const [key, value] of Object.entries(dataset)) root.setAttribute(key, value)
    root.append(document.createTextNode("A promise settles exactly once."))
    document.body.append(root)
    return root
}

/** Select `length` characters of a node's text and tell the document about it. */
const selectText = (node: Node, start: number, end: number) => {
    const range = document.createRange()
    range.setStart(node, start)
    range.setEnd(node, end)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    fireEvent(document, new Event("selectionchange"))
}

/** Collapse the selection and tell the document about it. */
const clearSelection = () => {
    window.getSelection()?.removeAllRanges()
    fireEvent(document, new Event("selectionchange"))
}

const surface = () => document.querySelector("pre")

afterEach(() => {
    vi.restoreAllMocks()
    document.body.replaceChildren()
    window.getSelection()?.removeAllRanges()
    vi.clearAllMocks()
    vi.mocked(useGlobalAiChat).mockReturnValue(chat as never)
})

describe("StarCiAiSelectionAsk", () => {
    it("offers nothing at all until the reader has selected something", () => {
        render(<StarCiAiSelectionAsk />)
        expect(surface()).toBeNull()
    })

    it("offers the three actions over the exact prose the reader selected", () => {
        render(<StarCiAiSelectionAsk />)
        const root = mountRoot()
        selectText(root.firstChild!, 2, 25)

        expect(surface()).toBeInTheDocument()
        expect(screen.getByText("promise settles exactly")).toBeInTheDocument()
        expect(screen.getAllByRole("button").map((button) => button.textContent))
            .toEqual(["append", "tangent", "dismiss"])
    })

    it("reads a source root as code and names the language from its own path", () => {
        render(<StarCiAiSelectionAsk />)
        const root = mountRoot({
            "data-ai-kind": "code",
            "data-ai-path": "src/useTodos.ts",
            "data-ai-start-line": "12",
            "data-ai-end-line": "18",
            "data-ai-local-edit": "true",
            "data-ai-runtime-error": "TypeError: undefined",
        })
        selectText(root.firstChild!, 0, 20)

        expect(document.querySelector("pre")?.textContent)
            .toBe("A promise settles ex")
        expect(document.querySelector("pre")?.previousElementSibling)
            .toHaveTextContent("ts")
    })

    it("reads a root with no kind of its own as prose", () => {
        render(<StarCiAiSelectionAsk />)
        const root = mountRoot({ "data-ai-kind": "markdown", "data-ai-path": "lesson.md" })
        selectText(root.firstChild!, 0, 20)

        expect(document.querySelector("pre")?.textContent)
            .toBe("A promise settles ex")
    })

    it("hands the quote to the open chat and closes the surface behind it", () => {
        render(<StarCiAiSelectionAsk />)
        const root = mountRoot({ "data-ai-kind": "code", "data-ai-path": "a.ts" })
        selectText(root.firstChild!, 0, 20)
        fireEvent.click(screen.getByRole("button", { name: "append" }))

        expect(chat.setCodeContext).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ kind: "code", quote: "A promise settles ex", path: "a.ts" }),
        )
        expect(chat.open).toHaveBeenCalledOnce()
        expect(chat.startTangent).not.toHaveBeenCalled()
        expect(surface()).toBeNull()
    })

    it("opens a tangent on the quote without joining the chat already running", () => {
        render(<StarCiAiSelectionAsk />)
        const root = mountRoot()
        selectText(root.firstChild!, 0, 20)
        fireEvent.click(screen.getByRole("button", { name: "tangent" }))

        expect(chat.startTangent).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ kind: "prose", quote: "A promise settles ex" }),
        )
        expect(chat.open).not.toHaveBeenCalled()
        expect(surface()).toBeNull()
    })

    it("takes the surface away without asking the chat anything", () => {
        render(<StarCiAiSelectionAsk />)
        const root = mountRoot()
        selectText(root.firstChild!, 0, 20)
        fireEvent.click(screen.getByRole("button", { name: "dismiss" }))

        expect(surface()).toBeNull()
        expect(chat.setCodeContext).not.toHaveBeenCalled()
        expect(chat.startTangent).not.toHaveBeenCalled()
    })

    it("takes the surface away again once the reader deselects", () => {
        render(<StarCiAiSelectionAsk />)
        const root = mountRoot()
        selectText(root.firstChild!, 0, 20)
        expect(surface()).toBeInTheDocument()

        clearSelection()
        expect(surface()).toBeNull()
    })

    it("stays out of the way of text selected outside an opted-in root", () => {
        render(<StarCiAiSelectionAsk />)
        const outside = document.createElement("div")
        outside.append(document.createTextNode("A promise settles exactly once."))
        document.body.append(outside)
        selectText(outside.firstChild!, 0, 20)

        expect(surface()).toBeNull()
    })

    it("refuses a selection too short to ground a question", () => {
        render(<StarCiAiSelectionAsk />)
        const root = mountRoot()
        selectText(root.firstChild!, 0, 2)

        expect(surface()).toBeNull()
    })

    it("reads a selection that spans elements from the element they share", () => {
        render(<StarCiAiSelectionAsk />)
        const root = mountRoot()
        root.replaceChildren()
        const first = document.createElement("span")
        first.append(document.createTextNode("A promise "))
        const second = document.createElement("span")
        second.append(document.createTextNode("settles once."))
        root.append(first, second)

        const range = document.createRange()
        range.setStart(first.firstChild!, 0)
        range.setEnd(second.firstChild!, 13)
        window.getSelection()?.removeAllRanges()
        window.getSelection()?.addRange(range)
        fireEvent(document, new Event("selectionchange"))

        expect(screen.getByText("A promise settles once.")).toBeInTheDocument()
    })

    it("stays hidden when the platform reports no selection object at all", () => {
        vi.spyOn(window, "getSelection").mockReturnValue(null)
        render(<StarCiAiSelectionAsk />)
        fireEvent(document, new Event("selectionchange"))

        expect(surface()).toBeNull()
    })

    it("stays hidden for a selection that reports no range to read", () => {
        const root = mountRoot()
        const range = document.createRange()
        range.setStart(root.firstChild!, 0)
        range.setEnd(root.firstChild!, 20)
        vi.spyOn(window, "getSelection").mockReturnValue({
            isCollapsed: false,
            rangeCount: 0,
            getRangeAt: () => range,
            toString: () => "A promise settles ex",
        } as never)
        render(<StarCiAiSelectionAsk />)
        fireEvent(document, new Event("selectionchange"))

        expect(surface()).toBeNull()
    })

    it("stops listening once the reader leaves the page it was watching", () => {
        const view = render(<StarCiAiSelectionAsk />)
        const root = mountRoot()
        view.unmount()
        selectText(root.firstChild!, 0, 20)

        expect(surface()).toBeNull()
    })
})

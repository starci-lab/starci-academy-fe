import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Tree } from "@/components/branches/Tree"
import { contentTabRow, type ContentTabRowData } from "./component"

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver

const renderRow = (props: ContentTabRowData, on = {}) => render(
    <Tree contract="dual-tabs-toolbar" render={contentTabRow(props, on)} />,
)

describe("ContentTabRow", () => {
    it("dispatches each available finite face to its named action", () => {
        const selectReading = vi.fn()
        const selectChallenge = vi.fn()
        const selectSource = vi.fn()
        renderRow({
            facesLabel: "Lesson faces",
            selectedFace: "reading",
            faces: [
                { id: "reading", label: "Reading" },
                { id: "challenge", label: "Challenge" },
                { id: "source", label: "Source" },
            ],
        }, { selectReading, selectChallenge, selectSource })

        fireEvent.click(screen.getByText("Challenge"))
        fireEvent.click(screen.getByText("Source"))
        fireEvent.click(screen.getByText("Reading"))

        expect(selectChallenge).toHaveBeenCalledTimes(1)
        expect(selectSource).toHaveBeenCalledTimes(1)
        expect(selectReading).toHaveBeenCalledTimes(1)
    })

    it("does not dispatch disabled or locked faces", () => {
        const selectChallenge = vi.fn()
        const selectSource = vi.fn()
        renderRow({
            facesLabel: "Lesson faces",
            selectedFace: "reading",
            faces: [
                { id: "reading", label: "Reading" },
                { id: "challenge", label: "Challenge", disabled: true },
                { id: "source", label: "Source", locked: true },
            ],
        }, { selectChallenge, selectSource })

        fireEvent.click(screen.getByText("Challenge"))
        fireEvent.click(screen.getByText("Source"))

        expect(selectChallenge).not.toHaveBeenCalled()
        expect(selectSource).not.toHaveBeenCalled()
    })

    it("reports the language the reader picked without touching which face is open", () => {
        const selectLanguage = vi.fn()
        const selectReading = vi.fn()
        renderRow({
            facesLabel: "Lesson faces",
            selectedFace: "reading",
            faces: [{ id: "reading", label: "Reading" }],
            languagesLabel: "Example language",
            selectedLanguage: "ts",
            languages: [
                { id: "ts", label: "TypeScript" },
                { id: "py", label: "Python" },
            ],
        }, { selectLanguage, selectReading })

        fireEvent.click(screen.getByRole("button", { name: /Example language/ }))
        fireEvent.click(screen.getByRole("option", { name: "Python" }))

        expect(selectLanguage).toHaveBeenCalledExactlyOnceWith("py")
        expect(selectReading).not.toHaveBeenCalled()
    })

    it("opens on the first face and the first language when the page names neither", () => {
        renderRow({
            facesLabel: "Lesson faces",
            faces: [
                { id: "source", label: "Source", icon: "code" },
                { id: "reading", label: "Reading" },
            ],
            languagesLabel: "Example language",
            languages: [
                { id: "ts", label: "TypeScript" },
                { id: "py", label: "Python" },
            ],
        })

        expect(screen.getByRole("tab", { name: "Source" })).toHaveAttribute("aria-selected", "true")
        expect(screen.getByRole("tab", { name: "Reading" })).toHaveAttribute("aria-selected", "false")
        expect(screen.getByRole("button", { name: /Example language/ })).toHaveTextContent("TypeScript")
        expect(screen.getByRole("tab", { name: "Source" }).querySelector("svg")).toBeInTheDocument()
        expect(screen.getByRole("tab", { name: "Reading" }).querySelector("svg")).toBeNull()
    })

    it("omits the language field for a lesson whose examples have no languages", () => {
        renderRow({
            facesLabel: "Lesson faces",
            selectedFace: "reading",
            faces: [{ id: "reading", label: "Reading" }],
        })

        expect(screen.getByRole("tablist")).toHaveAccessibleName("Lesson faces")
        expect(screen.queryByRole("button", { name: /Example language/ })).toBeNull()
    })

    it("draws both axes empty rather than guessing a selection out of nothing", () => {
        renderRow({ facesLabel: "Lesson faces", faces: [] })

        expect(screen.queryAllByRole("tab")).toHaveLength(0)
        expect(screen.getAllByRole("tablist")).toHaveLength(1)
    })

    it("ignores a press on a face the content does not carry", () => {
        const selectReading = vi.fn()
        const selectSource = vi.fn()
        renderRow({
            facesLabel: "Lesson faces",
            selectedFace: "reading",
            faces: [{ id: "reading", label: "Reading" }],
            languagesLabel: "Example language",
            languages: [{ id: "ts", label: "TypeScript" }],
        }, { selectReading, selectSource })

        fireEvent.click(screen.getByRole("button", { name: /Example language/ }))

        expect(selectReading).not.toHaveBeenCalled()
        expect(selectSource).not.toHaveBeenCalled()
    })

    it("keeps the selected face inside the finite reader union", () => {
        const props: ContentTabRowData = {
            facesLabel: "Lesson faces",
            // @ts-expect-error sandbox is not an approved reader face.
            selectedFace: "sandbox",
            faces: [{ id: "reading", label: "Reading" }],
        }
        expect(props.selectedFace).toBe("sandbox")
    })
})

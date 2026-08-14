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

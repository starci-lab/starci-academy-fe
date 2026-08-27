import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { SandboxCodeSelection } from "@/modules/code/sandbox-repo"
import { CodeReaderWorkspace } from "."

type EditorUpdate = {
    readonly selectionSet: boolean
    readonly state: {
        readonly selection: { readonly main: { readonly from: number, readonly to: number, readonly empty: boolean } }
        readonly doc: { readonly lineAt: (position: number) => { readonly number: number } }
        readonly sliceDoc: (from: number, to: number) => string
    }
}

type CodeMirrorFixtureProps = {
    readonly value?: string
    readonly "aria-label"?: string
    readonly onUpdate?: (update: EditorUpdate) => void
}

const mocks = vi.hoisted(() => ({ onUpdate: undefined as undefined | ((update: EditorUpdate) => void) }))

vi.mock("@uiw/react-codemirror", () => ({
    EditorView: { lineWrapping: {} },
    default: (props: CodeMirrorFixtureProps) => {
        mocks.onUpdate = props.onUpdate
        return <textarea aria-label={props["aria-label"]} value={props.value} readOnly />
    },
}))

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver

describe("CodeReaderWorkspace", () => {
    it("renders a readonly source tree and reports selected source text", () => {
        const activateFile = vi.fn()
        const selectionChange = vi.fn<(selection?: SandboxCodeSelection) => void>()
        const { container } = render(
            <CodeReaderWorkspace
                props={{
                    files: {
                        "/src/app.module.ts": { code: "export class AppModule {}" },
                        "/src/dog/dog.service.ts": { code: "export class DogService {}" },
                    },
                    activePath: "/src/app.module.ts",
                    filesLabel: "Source files",
                    editorLabel: "Readonly source",
                }}
                on={{ activateFile, selectionChange }}
            />,
        )

        expect(container.querySelector("nav")).toBeInTheDocument()
        expect(screen.getByLabelText("Readonly source")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Open /src/dog/dog.service.ts" }))
        expect(activateFile).toHaveBeenCalledWith("/src/dog/dog.service.ts")

        mocks.onUpdate?.({
            selectionSet: true,
            state: {
                selection: { main: { from: 7, to: 23, empty: false } },
                doc: { lineAt: (position) => ({ number: position < 20 ? 1 : 2 }) },
                sliceDoc: () => "class AppModule",
            },
        })
        expect(selectionChange).toHaveBeenCalledWith({
            path: "/src/app.module.ts",
            startLine: 1,
            endLine: 2,
            text: "class AppModule",
        })
    })
})

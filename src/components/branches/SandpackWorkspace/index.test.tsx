/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { PropsWithChildren } from "react"
import { SandpackWorkspace } from "./index"

type SandpackProviderMockProps = PropsWithChildren
type SandpackPreviewMockProps = { readonly "aria-label"?: string }
type CodeMirrorMockProps = {
    readonly value?: string
    readonly "aria-label"?: string
    readonly onChange?: (value: string) => void
}

const mocks = vi.hoisted(() => ({
    openFile: vi.fn(),
    updateFile: vi.fn(),
    runtimeError: null as null | { message: string },
}))

vi.mock("@codesandbox/sandpack-react", () => ({
    SandpackProvider: (input: SandpackProviderMockProps) => <div data-testid="provider">{input.children}</div>,
    SandpackPreview: (props: SandpackPreviewMockProps) => <div aria-label={props["aria-label"]} />,
    useSandpack: () => ({
        sandpack: {
            files: { "/src/App.tsx": { code: "source" }, "/src/api.ts": { code: "api" } },
            activeFile: "/src/App.tsx",
            openFile: mocks.openFile,
            updateFile: mocks.updateFile,
            error: mocks.runtimeError,
        },
    }),
}))

vi.mock("@uiw/react-codemirror", () => ({
    default: (props: CodeMirrorMockProps) => (
        <textarea
            aria-label={props["aria-label"]}
            value={props.value}
            onChange={(event) => props.onChange?.(event.target.value)}
        />
    ),
    EditorView: { lineWrapping: [] },
}))

beforeEach(() => {
    mocks.openFile.mockReset()
    mocks.updateFile.mockReset()
    mocks.runtimeError = null
})

const props = {
    files: { "/src/App.tsx": { code: "source" }, "/src/api.ts": { code: "api" } },
    activePath: "/src/App.tsx",
    filesLabel: "Source files",
    editorLabel: "Source editor",
    previewLabel: "Sandbox preview",
}

describe("SandpackWorkspace", () => {
    it("renders the controlled editor, source tree and local preview", () => {
        render(<SandpackWorkspace props={props} />)

        expect(screen.getByRole("navigation")).toBeInTheDocument()
        expect(screen.getByRole("textbox", { name: "Source editor" })).toHaveValue("source")
        expect(screen.getByLabelText("Sandbox preview")).toBeInTheDocument()
    })

    it("updates Sandpack and reports the current browser-local source", () => {
        const updateFile = vi.fn()
        render(<SandpackWorkspace props={props} on={{ updateFile }} />)

        fireEvent.change(screen.getByRole("textbox", { name: "Source editor" }), { target: { value: "changed" } })
        expect(mocks.updateFile).toHaveBeenCalledWith("/src/App.tsx", "changed", true)
        expect(updateFile).toHaveBeenCalledWith("/src/App.tsx", "changed")
    })

    it("opens files through the Sandpack API instead of scraping vendor DOM", () => {
        const activateFile = vi.fn()
        render(<SandpackWorkspace props={props} on={{ activateFile }} />)

        fireEvent.click(screen.getByRole("button", { name: "Open /src/api.ts" }))
        expect(mocks.openFile).toHaveBeenCalledWith("/src/api.ts")
        expect(activateFile).toHaveBeenCalledWith("/src/api.ts")
    })
})

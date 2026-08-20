/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { PropsWithChildren } from "react"
import type { SandpackFiles } from "@codesandbox/sandpack-react"
import type { SandboxCodeSelection } from "@/modules/code/sandbox-repo"
import { SandpackWorkspace } from "./index"

type SandpackProviderMockProps = PropsWithChildren<{
    readonly template?: string
    readonly customSetup?: { readonly dependencies?: Readonly<Record<string, string>> }
    readonly options?: { readonly activeFile?: string }
}>
type SandpackPreviewMockProps = { readonly "aria-label"?: string }
type EditorUpdate = {
    readonly selectionSet: boolean
    readonly state: {
        readonly selection: { readonly main: { readonly from: number, readonly to: number, readonly empty: boolean } }
        readonly doc: { readonly lineAt: (position: number) => { readonly number: number } }
        readonly sliceDoc: (from: number, to: number) => string
    }
}
type CodeMirrorMockProps = {
    readonly value?: string
    readonly "aria-label"?: string
    readonly extensions?: ReadonlyArray<unknown>
    readonly onChange?: (value: string) => void
    readonly onUpdate?: (update: EditorUpdate) => void
}

const mocks = vi.hoisted(() => ({
    openFile: vi.fn(),
    updateFile: vi.fn(),
    runtimeError: null as unknown,
    sandpackFiles: {} as Record<string, { code: string }>,
    activeFile: "/src/App.tsx",
    provider: vi.fn(),
    editor: vi.fn(),
    onUpdate: undefined as undefined | ((update: EditorUpdate) => void),
}))

vi.mock("@codesandbox/sandpack-react", () => ({
    SandpackProvider: (input: SandpackProviderMockProps) => {
        mocks.provider(input)
        return <div data-testid="provider">{input.children}</div>
    },
    SandpackPreview: (props: SandpackPreviewMockProps) => <div aria-label={props["aria-label"]} />,
    useSandpack: () => ({
        sandpack: {
            files: mocks.sandpackFiles,
            activeFile: mocks.activeFile,
            openFile: mocks.openFile,
            updateFile: mocks.updateFile,
            error: mocks.runtimeError,
        },
    }),
}))

vi.mock("@uiw/react-codemirror", () => ({
    default: (props: CodeMirrorMockProps) => {
        mocks.editor(props)
        mocks.onUpdate = props.onUpdate
        return (
            <textarea
                aria-label={props["aria-label"]}
                value={props.value}
                onChange={(event) => props.onChange?.(event.target.value)}
            />
        )
    },
    EditorView: { lineWrapping: [] },
}))

/** One CodeMirror update, as the controlled editor reports selection changes. */
const editorUpdate = (from: number, to: number, selectionSet = true): EditorUpdate => ({
    selectionSet,
    state: {
        selection: { main: { from, to, empty: from === to } },
        doc: { lineAt: (position: number) => ({ number: position < 10 ? 1 : 4 }) },
        sliceDoc: (start: number, end: number) => `sliced ${start}:${end}`,
    },
})

beforeEach(() => {
    mocks.openFile.mockReset()
    mocks.updateFile.mockReset()
    mocks.provider.mockReset()
    mocks.editor.mockReset()
    mocks.runtimeError = null
    mocks.activeFile = "/src/App.tsx"
    mocks.sandpackFiles = { "/src/App.tsx": { code: "source" }, "/src/api.ts": { code: "api" } }
    mocks.onUpdate = undefined
})

const files: SandpackFiles = { "/src/App.tsx": { code: "source" }, "/src/api.ts": { code: "api" } }

const props = {
    files,
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

    it("still drives the runtime when the host reported no handlers at all", () => {
        render(<SandpackWorkspace props={props} />)

        fireEvent.change(screen.getByRole("textbox", { name: "Source editor" }), { target: { value: "changed" } })
        fireEvent.click(screen.getByRole("button", { name: "Open /src/api.ts" }))
        expect(mocks.updateFile).toHaveBeenCalledWith("/src/App.tsx", "changed", true)
        expect(mocks.openFile).toHaveBeenCalledWith("/src/api.ts")
    })

    it("boots the vendor runtime on the requested template and dependencies", () => {
        render(<SandpackWorkspace
            props={{ ...props, template: "vite-react", dependencies: { react: "^19.0.0" }, activePath: "src/App.tsx" }}
        />)
        expect(mocks.provider.mock.calls[0][0]).toMatchObject({
            template: "vite-react",
            customSetup: { dependencies: { react: "^19.0.0" } },
            options: { activeFile: "/src/App.tsx" },
        })
    })

    it("falls back to the React TypeScript template and no extra dependencies", () => {
        render(<SandpackWorkspace props={props} />)
        expect(mocks.provider.mock.calls[0][0]).toMatchObject({
            template: "react-ts",
            customSetup: { dependencies: {} },
        })
    })

    it("opens the requested file only when the runtime holds it and is showing another", () => {
        mocks.activeFile = "/src/api.ts"
        render(<SandpackWorkspace props={props} />)
        expect(mocks.openFile).toHaveBeenCalledWith("/src/App.tsx")
    })

    it("does not open a file the runtime never received, nor one already shown", () => {
        render(<SandpackWorkspace props={props} />)
        expect(mocks.openFile).not.toHaveBeenCalled()

        mocks.sandpackFiles = { "/src/api.ts": { code: "api" } }
        render(<SandpackWorkspace props={{ ...props, activePath: "/src/Missing.tsx" }} />)
        expect(mocks.openFile).not.toHaveBeenCalled()
    })

    it.each([
        ["a thrown Error", { message: "ReferenceError: x is not defined" }, "ReferenceError: x is not defined"],
        ["a bare string", "Build failed", "Build failed"],
        ["an unrecognised value", 500, "500"],
    ])("reports %s from the sandbox runtime", (_name, error, expected) => {
        mocks.runtimeError = error
        const runtimeError = vi.fn()
        render(<SandpackWorkspace props={props} on={{ runtimeError }} />)
        expect(runtimeError).toHaveBeenCalledWith(expected)
    })

    it("clears the reported runtime error once the sandbox recovers", () => {
        const runtimeError = vi.fn()
        render(<SandpackWorkspace props={props} on={{ runtimeError }} />)
        expect(runtimeError).toHaveBeenCalledWith(undefined)

        runtimeError.mockClear()
        mocks.runtimeError = undefined
        render(<SandpackWorkspace props={props} on={{ runtimeError }} />)
        expect(runtimeError).toHaveBeenCalledWith(undefined)
    })

    it("reports the exact lines and text of a real editor selection", () => {
        const selectionChange = vi.fn<(selection?: SandboxCodeSelection) => void>()
        render(<SandpackWorkspace props={props} on={{ selectionChange }} />)

        mocks.onUpdate?.(editorUpdate(4, 40))
        expect(selectionChange).toHaveBeenCalledWith({
            path: "/src/App.tsx",
            startLine: 1,
            endLine: 4,
            text: "sliced 4:40",
        })
    })

    it("withdraws the grounding when the caret collapses, and ignores a non-selection update", () => {
        const selectionChange = vi.fn<(selection?: SandboxCodeSelection) => void>()
        render(<SandpackWorkspace props={props} on={{ selectionChange }} />)

        mocks.onUpdate?.(editorUpdate(4, 4))
        expect(selectionChange).toHaveBeenCalledWith(undefined)

        selectionChange.mockClear()
        mocks.onUpdate?.(editorUpdate(4, 40, false))
        expect(selectionChange).not.toHaveBeenCalled()
    })

    it("marks only the files the learner actually edited", () => {
        const { rerender } = render(<SandpackWorkspace
            props={{ ...props, editedPaths: ["/src/api.ts"], editedLabel: "Edited locally" }}
        />)
        // The explorer rolls the mark up to the folder as well, so the edited file is marked twice.
        expect(screen.getAllByLabelText("Edited locally")).toHaveLength(2)

        rerender(<SandpackWorkspace props={props} />)
        expect(screen.queryByLabelText("Edited locally")).toBeNull()
    })

    it.each([
        ["/src/App.tsx", "source"],
        ["/src/api.ts", "api"],
        ["/main.py", ""],
        ["/Main.java", ""],
        ["/main.cpp", ""],
        ["/README.md", ""],
    ])("resolves a grammar for %s without failing on an unknown one", (activePath, code) => {
        render(<SandpackWorkspace props={{ ...props, activePath }} />)
        expect(screen.getByRole("textbox", { name: "Source editor" })).toHaveValue(code)
    })

    it("asks for a JSX grammar only for a file whose extension says so", () => {
        render(<SandpackWorkspace props={{ ...props, files: { "/a.js": { code: "js" } }, activePath: "/a.js" }} />)
        render(<SandpackWorkspace props={{ ...props, files: { "/a.jsx": { code: "jsx" } }, activePath: "/a.jsx" }} />)
        render(<SandpackWorkspace props={{ ...props, files: { "/a.ts": { code: "ts" } }, activePath: "/a.ts" }} />)
        expect(mocks.editor.mock.calls.map((call) => (call[0] as CodeMirrorMockProps).extensions?.length))
            .toEqual([2, 2, 2])
    })
})

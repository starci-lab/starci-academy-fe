/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SandpackShell } from "./index"

const mocks = vi.hoisted(() => ({
    openFile: vi.fn(),
    updateFile: vi.fn(),
    runtimeError: null as null | { message: string },
}))

vi.mock("@codesandbox/sandpack-react", () => ({
    SandpackProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="provider">{children}</div>,
    SandpackPreview: (props: { "aria-label"?: string }) => <div aria-label={props["aria-label"]} />,
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
    default: (props: { value?: string; "aria-label"?: string; onChange?: (value: string) => void }) => (
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
}

describe("SandpackShell", () => {
    it("renders the controlled editor, source tree and local preview", () => {
        render(<SandpackShell props={props} />)

        expect(screen.getByRole("navigation", { name: "Source files" })).toBeInTheDocument()
        expect(screen.getByRole("textbox", { name: "Source editor" })).toHaveValue("source")
        expect(screen.getByLabelText("Sandbox preview")).toBeInTheDocument()
    })

    it("updates Sandpack and reports the current browser-local source", () => {
        const updateFile = vi.fn()
        render(<SandpackShell props={props} on={{ updateFile }} />)

        fireEvent.change(screen.getByRole("textbox", { name: "Source editor" }), { target: { value: "changed" } })
        expect(mocks.updateFile).toHaveBeenCalledWith("/src/App.tsx", "changed", true)
        expect(updateFile).toHaveBeenCalledWith("/src/App.tsx", "changed")
    })

    it("opens files through the Sandpack API instead of scraping vendor DOM", () => {
        const activateFile = vi.fn()
        render(<SandpackShell props={props} on={{ activateFile }} />)

        fireEvent.click(screen.getByRole("button", { name: "Open /src/api.ts" }))
        expect(mocks.openFile).toHaveBeenCalledWith("/src/api.ts")
        expect(activateFile).toHaveBeenCalledWith("/src/api.ts")
    })
})

/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ContentSourceWorkspace, type ContentSourceWorkspaceData } from "./component"

vi.mock("@/components/shells/SandpackShell", () => ({
    SandpackShell: ({ on }: { on?: { updateFile?: (path: string, code: string) => void } }) => (
        <button type="button" onClick={() => on?.updateFile?.("/src/App.tsx", "changed")}>Editor</button>
    ),
}))

const props: ContentSourceWorkspaceData = {
    identity: "GitHub snapshot · Async patterns",
    loadingLabel: "Loading source",
    failedLabel: "Source could not be loaded",
    retryLabel: "Try again",
    resetLabel: "Reset sandbox",
    localChangesLabel: "Local changes",
    runtimeErrorLabel: "Preview failed",
    askErrorLabel: "Ask StarCi about this error",
    files: { "/src/App.tsx": { code: "source" } },
    activePath: "/src/App.tsx",
    filesLabel: "Source files",
    editorLabel: "Source editor",
}

describe("ContentSourceWorkspace", () => {
    it("keeps pending source separate from the article state", () => {
        const { container } = render(<ContentSourceWorkspace state="pending" props={props} />)
        expect(container.querySelector("[data-state=pending]")).toBeTruthy()
        expect(screen.queryByRole("button", { name: "Editor" })).not.toBeInTheDocument()
    })

    it("renders failure with retry and no leaked file names", () => {
        const retry = vi.fn()
        render(<ContentSourceWorkspace state="failed" props={props} on={{ retry }} />)
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledTimes(1)
        expect(screen.queryByText("/src/App.tsx")).not.toBeInTheDocument()
    })

    it("renders ready source, reports local edits and resets only when changed", () => {
        const updateFile = vi.fn()
        const reset = vi.fn()
        const { rerender } = render(
            <ContentSourceWorkspace state="ready" props={props} on={{ updateFile, reset }} />,
        )
        expect(screen.getByRole("button", { name: "Reset sandbox" })).toBeDisabled()

        rerender(
            <ContentSourceWorkspace
                state="ready"
                props={{ ...props, editedPaths: ["/src/App.tsx"] }}
                on={{ updateFile, reset }}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: "Editor" }))
        fireEvent.click(screen.getByRole("button", { name: "Reset sandbox" }))
        expect(updateFile).toHaveBeenCalledWith("/src/App.tsx", "changed")
        expect(reset).toHaveBeenCalledTimes(1)
        expect(screen.getByLabelText("Local changes")).toBeInTheDocument()
    })

    it("keeps compile failure visible and offers the AI debug action", () => {
        const askError = vi.fn()
        render(
            <ContentSourceWorkspace
                state="ready"
                props={{ ...props, runtimeError: "Build failed" }}
                on={{ askError }}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: "Ask StarCi about this error" }))
        expect(askError).toHaveBeenCalledTimes(1)
        expect(screen.getByLabelText("Preview failed")).toBeInTheDocument()
    })
})

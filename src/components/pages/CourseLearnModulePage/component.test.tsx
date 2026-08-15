import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseLearnModulePage } from "./component"

describe("_CourseLearnModulePage", () => {
    it("opens a lesson from the module disclosure", () => {
        const onContent = vi.fn()
        render(
            <_CourseLearnModulePage
                state="ready"
                title="Async patterns"
                label="Contents"
                module={{
                    id: "module-1",
                    displayId: "async-patterns",
                    title: "Async patterns",
                    numContents: 1,
                    contents: [{
                        id: "content-1",
                        title: "AbortController",
                        orderIndex: 1,
                    }],
                }}
                onContent={onContent}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "AbortController" }))
        expect(onContent).toHaveBeenCalledWith("content-1")
    })
})

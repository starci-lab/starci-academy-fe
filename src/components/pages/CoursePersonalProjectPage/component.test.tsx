import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CoursePersonalProjectPage } from "./component"

describe("_CoursePersonalProjectPage", () => {
    it("keeps progress facts before ordered task destinations", () => {
        const { container } = render(
            <_CoursePersonalProjectPage
                state="ready"
                props={{
                    title: "Personal Project",
                    description: "Build the project step by step.",
                    progressLabel: "Completion progress",
                    progressText: "1/2 tasks completed",
                    completionPercent: 50,
                    tasks: [
                        { id: "task-1", label: "Milestone 1 · Plan · Completed" },
                        { id: "task-2", label: "Milestone 1 · Build · Next task", isCurrent: true },
                    ],
                    retryLabel: "Try again",
                }}
                on={{ openTask: vi.fn() }}
            />,
        )

        const text = container.textContent ?? ""
        expect(text.indexOf("1/2 tasks completed")).toBeLessThan(text.indexOf("Milestone 1 · Plan"))
        expect(screen.getByText("Milestone 1 · Build · Next task")).toBeInTheDocument()
    })
})

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseCurriculumAccordion } from "."

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock)

describe("CourseCurriculumAccordion", () => {
    it("keeps every module in one surface and preserves the complete expanded anatomy", () => {
        render(
            <CourseCurriculumAccordion
                props={{
                    label: "Course content",
                    modules: [
                        {
                            id: "linux",
                            title: "Linux foundations",
                            level: "foundation",
                            levelLabel: "Foundation",
                            previewLabel: "2 previews",
                            summary: "4 contents · 96 min",
                            description: "Operate a real Linux machine from shell to services.",
                            previews: [
                                { id: "shell", title: "Navigate the filesystem safely." },
                                { id: "systemd", title: "Run services with systemd." },
                            ],
                        },
                        {
                            id: "terraform",
                            title: "Terraform fundamentals",
                            level: "intermediate",
                            levelLabel: "Intermediate",
                            summary: "3 contents · 72 min",
                            description: "Build infrastructure from typed configuration.",
                            previews: [],
                        },
                    ],
                }}
            />,
        )

        expect(screen.getByRole("heading", { name: "Course content" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /Linux foundations/ })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /Terraform fundamentals/ })).toBeInTheDocument()
        expect(screen.getByText("Foundation")).toBeInTheDocument()
        expect(screen.getByText("2 previews")).toBeInTheDocument()
        expect(screen.queryByText("4 contents · 96 min")).not.toBeInTheDocument()

        fireEvent.click(screen.getByText("Linux foundations"))

        expect(screen.getByText("4 contents · 96 min")).toBeVisible()
        expect(screen.getByText("Operate a real Linux machine from shell to services.")).toBeVisible()
        expect(screen.getByText("Navigate the filesystem safely.")).toBeVisible()
        expect(screen.getByText("Run services with systemd.")).toBeVisible()
        const previewList = screen.getByRole("list")
        expect(previewList.querySelectorAll("li")).toHaveLength(2)
        expect(previewList?.querySelector("svg")).toBeNull()
        expect(screen.getAllByText("•")).toHaveLength(2)
    })
})

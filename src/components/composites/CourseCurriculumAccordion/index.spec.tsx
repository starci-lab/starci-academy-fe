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

        const section = screen.getByRole("heading", { name: "Course content" }).closest("[data-node=\"course-curriculum-accordion\"]")
        expect(section?.querySelectorAll("[data-component=\"SurfaceAccordionCard\"]")).toHaveLength(1)
        expect(section?.querySelectorAll("[data-component=\"SurfaceAccordionCardItem\"]")).toHaveLength(2)
        expect(screen.getByText("Foundation")).toBeInTheDocument()
        expect(screen.getByText("2 previews")).toBeInTheDocument()
        expect(screen.getByText("4 contents · 96 min")).not.toBeVisible()

        fireEvent.click(screen.getByText("Linux foundations"))

        expect(screen.getByText("4 contents · 96 min")).toBeVisible()
        expect(screen.getByText("Operate a real Linux machine from shell to services.")).toBeVisible()
        expect(screen.getByText("Navigate the filesystem safely.")).toBeVisible()
        expect(screen.getByText("Run services with systemd.")).toBeVisible()
        const previewList = section?.querySelector("[data-node=\"supporting-dot-list\"]")
        expect(previewList).not.toBeNull()
        expect(previewList?.querySelectorAll("[data-node=\"supporting-dot-list-entry\"]")).toHaveLength(2)
        expect(previewList?.querySelector("svg")).toBeNull()
        expect(screen.getAllByText("•")).toHaveLength(2)
    })
})

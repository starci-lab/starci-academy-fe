import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CurriculumModuleRow } from "."

describe("CurriculumModuleRow", () => {
    it.each([
        ["foundation", "Foundation", "success"],
        ["intermediate", "Intermediate", "warning"],
        ["advanced", "Advanced", "danger"],
    ] as const)("maps %s to its own semantic badge tone", (level, label, tone) => {
        render(<CurriculumModuleRow props={{ title: "Module", level, levelLabel: label }} />)

        expect(screen.getByText(label)).toHaveAttribute("data-tone", tone)
    })

    it("reveals authored contents as one ordered list", () => {
        render(
            <CurriculumModuleRow
                props={{
                    title: "Architecture foundations",
                    lessons: [
                        { id: "content-1", title: "Boundaries" },
                        { id: "content-2", title: "Failure modes" },
                    ],
                }}
            />,
        )

        fireEvent.click(screen.getByText("Architecture foundations"))
        const list = screen.getByRole("list")
        expect(list.tagName).toBe("OL")
        expect(screen.getAllByRole("listitem")).toHaveLength(2)
        expect(list).toHaveTextContent("BoundariesFailure modes")
    })

    it("keeps the Heroicons disclosure chevron foreground and rotates it down on open", async () => {
        render(
            <CurriculumModuleRow
                props={{
                    title: "Architecture foundations",
                    lessons: [{ id: "content-1", title: "Boundaries" }],
                }}
            />,
        )

        const title = screen.getByText("Architecture foundations")
        const chevron = title.closest("button")?.querySelector("span")
        expect(chevron).toHaveClass("text-foreground", "rotate-0")
        fireEvent.click(title)
        await waitFor(() => expect(chevron).toHaveClass("rotate-90"))
        expect(chevron).not.toHaveClass("text-muted", "rotate-0")
        expect(chevron?.querySelector("svg")).toBeInTheDocument()
    })

    it("does not decorate preview lessons with a repeated status glyph", () => {
        render(
            <CurriculumModuleRow
                props={{
                    title: "Architecture foundations",
                    lessons: [
                        { id: "content-1", title: "Boundaries", isPreview: true },
                        { id: "content-2", title: "Failure modes", isPreview: true },
                    ],
                }}
            />,
        )

        fireEvent.click(screen.getByText("Architecture foundations"))
        expect(screen.getByRole("list").querySelector("svg")).toBeNull()
    })

    it("keeps a long module title compact and medium", () => {
        render(<CurriculumModuleRow props={{ title: "Platform foundations: framework and request lifecycle" }} />)

        expect(screen.getByText("Platform foundations: framework and request lifecycle"))
            .toHaveAttribute("data-size", "sm")
        expect(screen.getByText("Platform foundations: framework and request lifecycle"))
            .toHaveAttribute("data-weight", "medium")
    })
})

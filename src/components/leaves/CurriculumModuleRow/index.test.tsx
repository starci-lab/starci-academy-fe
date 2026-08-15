import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CurriculumModuleRow } from "."

describe("CurriculumModuleRow", () => {
    it.each([
        ["foundation", "Foundation", "success"],
        ["intermediate", "Intermediate", "warning"],
        ["advanced", "Advanced", "danger"],
    ] as const)("maps %s to its own semantic badge tone", (level, label, tone) => {
        render(<CurriculumModuleRow props={{ title: "Module", level, levelLabel: label }} />)

        expect(screen.getByText(label).closest("[data-component=\"Badge\"]")).toHaveAttribute("data-tone", tone)
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
            .toHaveClass("text-sm", "font-medium")
    })
})

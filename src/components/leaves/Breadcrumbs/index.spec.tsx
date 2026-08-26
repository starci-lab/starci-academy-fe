import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Breadcrumbs } from "."

describe("Breadcrumbs", () => {
    it("keeps a short path as a complete breadcrumb trail", () => {
        render(<Breadcrumbs props={{ label: "Course path", steps: [
            { id: "course", label: "Course" },
            { id: "lesson", label: "Lesson" },
        ] }} on={{ course: vi.fn() }} />)

        expect(screen.getByRole("list", { name: "Course path" })).toBeInTheDocument()
        expect(screen.getByText("Course")).toBeInTheDocument()
        expect(screen.getByText("Lesson")).toBeInTheDocument()
    })

    it("turns a path of three or more steps into one back link", () => {
        const back = vi.fn()
        render(<Breadcrumbs props={{ label: "Lesson path", steps: [
            { id: "course", label: "Course" },
            { id: "module", label: "Backend foundations" },
            { id: "lesson", label: "Frameworks" },
        ] }} on={{ course: vi.fn(), module: back }} />)

        expect(screen.queryByRole("list", { name: "Lesson path" })).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("link", { name: "Back" }))
        expect(back).toHaveBeenCalledOnce()
        expect(screen.getByText("Back")).toBeInTheDocument()
        expect(screen.queryByText("Backend foundations")).not.toBeInTheDocument()
        expect(screen.queryByText("Frameworks")).not.toBeInTheDocument()
    })

    it("keeps a meaningful journey trail expanded when requested", () => {
        render(<Breadcrumbs props={{ label: "Study path", showFullTrail: true, steps: [
            { id: "course", label: "Fullstack Mastery" },
            { id: "mode", label: "Review" },
            { id: "session", label: "Study" },
        ] }} on={{ course: vi.fn(), mode: vi.fn() }} />)

        expect(screen.getByRole("list", { name: "Study path" })).toBeInTheDocument()
        expect(screen.getByText("Fullstack Mastery")).toBeInTheDocument()
        expect(screen.getByText("Review")).toBeInTheDocument()
        expect(screen.getByText("Study")).toBeInTheDocument()
        expect(screen.queryByText("Back")).not.toBeInTheDocument()
    })
})

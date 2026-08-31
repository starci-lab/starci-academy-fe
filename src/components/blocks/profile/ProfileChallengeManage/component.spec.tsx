import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProfileChallengeManageBase } from "./component"

const callbacks = () => ({ back: vi.fn(), search: vi.fn(), filter: vi.fn(), select: vi.fn(), retry: vi.fn(), clearSearch: vi.fn(), browseCourses: vi.fn() })

describe("ProfileChallengeManageBase", () => {
    it("keeps one empty result status and offers course discovery", () => {
        const on = callbacks()
        render(<ProfileChallengeManageBase state="ready" courseTitle="Frontend" rows={[]} query="" filterLabel="Filters" on={on} />)

        expect(screen.getByText("Passed submissions")).toBeInTheDocument()
        expect(screen.getByText("No passed submissions were found.")).toBeInTheDocument()
        expect(screen.queryByText("0 found")).not.toBeInTheDocument()
        expect(screen.queryByText("0 passed submissions")).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Filters" })).toHaveAttribute("data-size", "md")
        fireEvent.click(screen.getByRole("button", { name: "Browse courses" }))
        expect(on.browseCourses).toHaveBeenCalledOnce()
    })

    it("offers clear search for an empty filtered result", () => {
        const on = callbacks()
        render(<ProfileChallengeManageBase state="ready" courseTitle="Frontend" rows={[]} query="graph" filterLabel="Filters" on={on} />)

        expect(screen.getByText("No submissions match this search.")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Clear search" }))
        expect(on.clearSearch).toHaveBeenCalledOnce()
        expect(screen.queryByRole("button", { name: "Browse courses" })).not.toBeInTheDocument()
    })
})

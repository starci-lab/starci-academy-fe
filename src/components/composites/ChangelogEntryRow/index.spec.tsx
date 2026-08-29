import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ChangelogEntryRow } from "."

describe("ChangelogEntryRow", () => {
    it("keeps date, category, title and body as separate semantics", () => {
        const { container } = render(<ChangelogEntryRow props={{
            id: "entry",
            dateLabel: "12/08/2026",
            categoryLabel: "Feature",
            categoryTone: "success",
            title: "Faster avatars",
            body: "Images now load from local SVG data.",
        }} />)
        expect(screen.getByText("12/08/2026")).toBeInTheDocument()
        expect(screen.getByText("Feature").closest("[data-tone]")).toHaveAttribute("data-tone", "success")
        expect(screen.getByText("Faster avatars")).toBeInTheDocument()
        expect(screen.getByText("Images now load from local SVG data.")).toBeInTheDocument()

        const row = container.querySelector("[data-part=\"changelog-entry\"]")
        const meta = container.querySelector("[data-part=\"changelog-meta\"]")
        expect(row).toHaveClass("flex", "min-w-0", "flex-col", "gap-2", "border-b", "border-separator", "p-3", "last:border-b-0")
        expect(meta).toHaveClass("flex", "min-w-0", "flex-wrap", "items-center", "gap-2")
    })

    it("reports an actionable title without owning navigation", () => {
        const open = vi.fn()
        render(<ChangelogEntryRow props={{ id: "entry", title: "Read update", isAction: true }} on={{ open }} />)
        fireEvent.click(screen.getByText("Read update"))
        expect(open).toHaveBeenCalledOnce()
    })
})

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ChangelogListBase } from "./component"

const props = {
    label: "What's new",
    emptyMessage: "Nothing new",
    errorMessage: "Could not load updates",
    entries: [{
        id: "one",
        dateLabel: "12/08/2026",
        category: "feature",
        categoryLabel: "Feature",
        title: "Faster avatars",
        body: "Avatar fallbacks now use Lorelei.",
        isAction: true,
    }],
} as const

describe("ChangelogListBase", () => {
    it("renders joined semantic rows with full-width separators", () => {
        const { container } = render(<ChangelogListBase state="ready" props={props} />)
        expect(screen.getByText("12/08/2026")).toBeInTheDocument()
        expect(screen.getByText("Feature")).toBeInTheDocument()
        expect(screen.getByText("Feature").closest("[data-tone]")).toHaveAttribute("data-tone", "neutral")
        expect(screen.getByText("Faster avatars")).toBeInTheDocument()
        expect(screen.getByText("Avatar fallbacks now use Lorelei.")).toBeInTheDocument()
        expect(container.textContent).toContain("Faster avatars")
    })

    it("reports which entry was opened", () => {
        const open = vi.fn()
        render(<ChangelogListBase state="ready" props={props} on={{ open }} />)
        fireEvent.click(screen.getByText("Faster avatars"))
        expect(open).toHaveBeenCalledWith("one")
    })

    it("keeps four joined resting rows", () => {
        const { container } = render(<ChangelogListBase state="pending" props={props} />)
        expect(container.textContent).toContain("\u00a0")
    })

    it("keeps the settled empty list visible with its empty-state copy", () => {
        render(<ChangelogListBase state="empty" props={props} />)
        expect(screen.getByText("Nothing new")).toBeInTheDocument()
    })

    it("keeps the failed list visible and retryable", () => {
        const retry = vi.fn()
        render(<ChangelogListBase state="failed" props={{ ...props, retryLabel: "Retry" }} on={{ retry }} />)
        expect(screen.getByText("Could not load updates")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledOnce()
    })
})

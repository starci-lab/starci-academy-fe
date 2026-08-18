import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _ChangelogList } from "./component"

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

describe("_ChangelogList", () => {
    it("renders joined semantic rows with full-width separators", () => {
        const { container } = render(<_ChangelogList state="ready" props={props} />)
        expect(screen.getByText("12/08/2026")).toBeInTheDocument()
        expect(screen.getByText("Feature").closest("[data-tone]")).toHaveAttribute("data-tone", "success")
        expect(screen.getByText("Faster avatars")).toBeInTheDocument()
        expect(screen.getByText("Avatar fallbacks now use Lorelei.")).toBeInTheDocument()
        const list = container.querySelector("[data-node=\"changelog-list\"]")
        expect(list?.className).toContain("divide-y")
        expect(list?.className).toContain("divide-separator")
        expect(list?.className).toContain("p-0")
        expect(list?.className).toContain("[&>*]:px-4")
        expect(list?.querySelectorAll(":scope > [data-node=\"changelog-entry-row\"]")).toHaveLength(1)
    })

    it("reports which entry was opened", () => {
        const open = vi.fn()
        render(<_ChangelogList state="ready" props={props} on={{ open }} />)
        fireEvent.click(screen.getByText("Faster avatars"))
        expect(open).toHaveBeenCalledWith("one")
    })

    it("keeps four joined resting rows", () => {
        const { container } = render(<_ChangelogList state="pending" props={props} />)
        expect(container.querySelectorAll("[data-node=\"changelog-entry-row\"]")).toHaveLength(4)
    })

    it("hides the whole settled empty block", () => {
        const { container } = render(<_ChangelogList state="empty" props={props} />)
        expect(container).toBeEmptyDOMElement()
    })
})

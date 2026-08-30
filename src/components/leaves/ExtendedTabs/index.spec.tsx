/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ExtendedTabs } from "."

describe("ExtendedTabs", () => {
    it("keeps an accessible name on every icon-only narrow tab", () => {
        render(<ExtendedTabs props={{
            label: "Profile sections",
            selectedKey: "overview",
            tabs: [
                { id: "overview", label: "Overview", icon: "home" },
                { id: "skills", label: "Skills", icon: "practice" },
            ],
        }} />)

        expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-label", "Overview")
        expect(screen.getByRole("tab", { name: "Skills" })).toHaveAttribute("aria-label", "Skills")
    })

    it("leaves horizontal overflow to the routed Grammar tab region", () => {
        const { container } = render(<ExtendedTabs props={{
            label: "Workspace views",
            selectedKey: "brief",
            inset: "none",
            labelVisibility: "always",
            tabs: [
                { id: "brief", label: "Challenge brief", icon: "course" },
                { id: "submit", label: "Submit", icon: "review" },
            ],
        }} />)

        expect(container.firstElementChild).not.toHaveClass("overflow-x-auto")
        expect(container.querySelector("[data-grammar-tabs-overflow='scroll']")).toBeTruthy()
    })
})

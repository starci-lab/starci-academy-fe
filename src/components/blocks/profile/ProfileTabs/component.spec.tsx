import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProfileTabsBase, type ProfileTabsData } from "./component"

const tabs: ProfileTabsData = {
    label: "Profile sections",
    selectedKey: "overview",
    tabs: [
        { id: "overview", label: "Overview", icon: "home" },
        { id: "courses", label: "Courses", icon: "course" },
        { id: "challenges", label: "Challenges", icon: "practice" },
    ],
    labelVisibility: "always",
}

describe("ProfileTabsBase", () => {
    it("draws every profile destination inside the profile-owned strip and marks the current one", () => {
        render(<ProfileTabsBase props={tabs} />)

        expect(screen.getByRole("tablist", { name: "Profile sections" })).not.toBeNull()
        expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
            "Overview",
            "Courses",
            "Challenges",
        ])
        expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true")
        expect(screen.getByRole("tab", { name: "Courses" })).toHaveAttribute("aria-selected", "false")
        expect(document.querySelector("[data-grammar-tab-labels='always']")).not.toBeNull()
        expect(document.querySelector("[class*='scroll-pe-6']")).toHaveClass(
            "w-full",
            "min-w-0",
            "[&_[data-grammar-tabs-overflow=scroll]]:pe-6",
            "[&_[data-grammar-tabs-overflow=scroll]]:scroll-pe-6",
        )
        expect(document.querySelector("[data-profile-tabs-overflow='discoverable']")).not.toBeNull()
        expect(document.querySelector("[data-profile-tabs-overflow='discoverable']")?.textContent).toContain("‹")
        expect(document.querySelector("[data-profile-tabs-overflow='discoverable']")?.textContent).toContain("›")
    })

    it("reports the pressed destination key to its owner", () => {
        const select = vi.fn()
        render(<ProfileTabsBase props={tabs} on={{ select }} />)

        fireEvent.click(screen.getByText("Challenges"))
        expect(select).toHaveBeenCalledExactlyOnceWith("challenges")
    })

    it("stays on the owner-controlled destination when no owner listens to the strip", () => {
        render(<ProfileTabsBase props={tabs} />)

        fireEvent.click(screen.getByText("Courses"))
        expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true")
        expect(screen.getByRole("tab", { name: "Courses" })).toHaveAttribute("aria-selected", "false")
    })
})

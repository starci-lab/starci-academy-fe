import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/profile/overview/OverviewJobReadiness", () => ({ OverviewJobReadiness: () => <div>Job readiness owner</div> }))
vi.mock("@/components/blocks/profile/overview/OverviewCourses", () => ({ OverviewCourses: () => <div>Courses owner</div> }))
vi.mock("@/components/blocks/profile/overview/OverviewContributions", () => ({ OverviewContributions: () => <div>Contributions owner</div> }))
vi.mock("@/components/blocks/profile/overview/OverviewChallengeSkills", () => ({ OverviewChallengeSkills: () => <div>Challenge skills owner</div> }))
vi.mock("@/components/blocks/profile/overview/OverviewCodeSkills", () => ({ OverviewCodeSkills: () => <div>Practice skills owner</div> }))

import { ProfileOverviewPageBase } from "./component"

describe("ProfileOverviewPageBase", () => {
    it("keeps primary evidence before the supporting readiness rail", () => {
        render(<ProfileOverviewPageBase />)
        const copy = screen.getAllByText(/owner$/).map((node) => node.textContent)

        expect(copy).toEqual([
            "Courses owner",
            "Challenge skills owner",
            "Practice skills owner",
            "Contributions owner",
            "Job readiness owner",
        ])
        const skills = screen.getByRole("region", { name: "Profile skills" })
        expect(skills).toHaveClass("grid", "grid-cols-1", "gap-4", "@app-sm:grid-cols-2")
        expect(skills.parentElement).toHaveClass("flex", "min-w-0", "flex-col", "gap-6")
        expect(screen.getByRole("complementary", { name: "Profile readiness" })).toBeInTheDocument()
    })
})

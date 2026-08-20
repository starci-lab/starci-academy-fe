import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/profile/overview/OverviewJobReadiness", () => ({ OverviewJobReadiness: () => <div>Job readiness owner</div> }))
vi.mock("@/components/blocks/profile/overview/OverviewCourses", () => ({ OverviewCourses: () => <div>Courses owner</div> }))
vi.mock("@/components/blocks/profile/overview/OverviewContributions", () => ({ OverviewContributions: () => <div>Contributions owner</div> }))
vi.mock("@/components/blocks/profile/overview/OverviewChallengeSkills", () => ({ OverviewChallengeSkills: () => <div>Challenge skills owner</div> }))
vi.mock("@/components/blocks/profile/overview/OverviewCodeSkills", () => ({ OverviewCodeSkills: () => <div>Practice skills owner</div> }))

import { ProfileOverviewPageBase } from "./component"

describe("ProfileOverviewPageBase", () => {
    it("keeps the five legacy owners in order and pairs only the two skill summaries", () => {
        const { container } = render(<ProfileOverviewPageBase />)
        const copy = screen.getAllByText(/owner$/).map((node) => node.textContent)

        expect(copy).toEqual([
            "Job readiness owner",
            "Courses owner",
            "Contributions owner",
            "Challenge skills owner",
            "Practice skills owner",
        ])
        expect(container.querySelectorAll("[data-node='profile-overview-skill-grid']")).toHaveLength(1)
        expect(container.querySelector("[data-component='ProfileEvidenceSection']")).toBeNull()
    })
})

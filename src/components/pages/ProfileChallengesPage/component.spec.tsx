import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
vi.mock("@/components/blocks/profile/ProfileChallenges", () => ({ ProfileChallenges: () => null }))
import { ProfileChallengesBase, type ProfileChallengesProps } from "@/components/blocks/profile/ProfileChallenges/component"

/**
 * What these tests guard.
 *
 * The tab settles three independent things: the headline standing, the list of passed proof, and
 * whether a proof row can be followed back to the course it belongs to. Each of the three has its
 * own resting, empty and failed answer, and none of them may borrow another's.
 */

const submission = {
    id: "submission",
    title: "Resilient checkout",
    selectedLang: "TypeScript",
    courseTitle: "Frontend Engineering",
    courseGlobalId: "course",
    passedAt: "2026-07-28",
    score: 94,
}

describe("ProfileChallengesBase", () => {
    it("renders headline strength before passed submission proof", () => {
        const html = renderToStaticMarkup(<ProfileChallengesBase strength={{ state: "ready", data: { percentile: 12, rank: 214, xp: 1840 } }} submissions={{ state: "ready", data: [submission] }} on={{ openCourse: vi.fn() }} />)
        expect(html.indexOf("Challenge strength")).toBeLessThan(html.indexOf("Passed submissions"))
        expect(html).toContain("Top 12%")
        expect(html).toContain("Resilient checkout")
    })

    it("rests three proof rows and every metric while both families are in flight", () => {
        render(
            <ProfileChallengesBase
                strength={{ state: "pending" }}
                submissions={{ state: "pending", data: [] }}
                on={{ openCourse: vi.fn() }}
            />,
        )

        expect(screen.queryByText("Standing unavailable")).not.toBeInTheDocument()
        expect(screen.queryByText("Search and filter")).not.toBeInTheDocument()
    })

    it("says standing is unavailable without borrowing the list's failure", () => {
        render(
            <ProfileChallengesBase
                strength={{ state: "error" }}
                submissions={{ state: "error", data: [] }}
                on={{ openCourse: vi.fn() }}
            />,
        )

        expect(screen.getByText("Standing unavailable")).toBeInTheDocument()
        expect(screen.getByText("Passed submissions couldn't be loaded.")).toBeInTheDocument()
    })

    it("counts settled proof and drops absent standing figures rather than showing a dash", () => {
        render(
            <ProfileChallengesBase
                strength={{ state: "ready", data: { percentile: null, rank: null, xp: null } }}
                submissions={{ state: "ready", data: [] }}
                on={{ openCourse: vi.fn() }}
            />,
        )

        expect(screen.getByText("passed")).toBeInTheDocument()
        expect(screen.queryByText("strength")).not.toBeInTheDocument()
        expect(screen.queryByText("rank")).not.toBeInTheDocument()
        expect(screen.queryByText("XP")).not.toBeInTheDocument()
        expect(screen.getByText("No challenges passed yet.")).toBeInTheDocument()
        expect(screen.getByText("Passed graded challenges appear here.")).toBeInTheDocument()
    })

    it("opens the owning course from a proof row that carries only a slug", () => {
        const openCourse = vi.fn()
        render(
            <ProfileChallengesBase
                strength={{ state: "ready", data: { rank: 214 } }}
                submissions={{
                    state: "ready",
                    data: [{ id: "slug-only", title: "Rate limiter", passedAt: "2026-07-28", courseSlug: "backend" }],
                }}
                on={{ openCourse }}
            />,
        )

        screen.getByRole("button", { name: "Rate limiter" }).click()
        expect(openCourse).toHaveBeenCalledWith("backend")
        expect(screen.getByText("#214")).toBeInTheDocument()
    })

    it("leaves a course-less proof row unpressable and prints an unparseable date verbatim", () => {
        const openCourse = vi.fn()
        render(
            <ProfileChallengesBase
                strength={{ state: "ready", data: { xp: 1840 } }}
                submissions={{
                    state: "ready",
                    data: [{ id: "orphan", title: "Orphan proof", passedAt: "sometime last spring", score: null }],
                }}
                on={{ openCourse }}
            />,
        )

        expect(screen.queryByRole("button", { name: "Orphan proof" })).not.toBeInTheDocument()
        expect(screen.getByText("sometime last spring")).toBeInTheDocument()
        expect(screen.getByText("1,840")).toBeInTheDocument()
        expect(openCourse).not.toHaveBeenCalled()
    })

    it("formats a parseable pass date and shows the score as the trailing fact", () => {
        const props: ProfileChallengesProps = {
            strength: { state: "ready", data: { percentile: 12 } },
            submissions: { state: "ready", data: [submission] },
            on: { openCourse: vi.fn() },
        }
        render(<ProfileChallengesBase {...props} />)

        expect(screen.getByText(/Jul 28/)).toBeInTheDocument()
        expect(screen.getByText("94")).toBeInTheDocument()
    })
})

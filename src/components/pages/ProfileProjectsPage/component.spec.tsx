import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ProfileProjectsPageBase } from "./component"

/**
 * What these tests guard.
 *
 * Pinned tiles and capstone rows are two independently settled families. A tile is pressable only
 * when the owner published a link for it, a capstone row is always pressable, and each family
 * answers its own empty and failed case rather than inheriting its neighbour's.
 */

const capstone = {
    courseGlobalId: "course",
    courseTitle: "Frontend Engineering",
    totalMilestones: 5,
    completedMilestones: 4,
    totalTasks: 22,
    completedTasks: 18,
    milestones: [],
}

describe("ProfileProjectsPageBase", () => {
    it("keeps pinned project tiles before the verified capstone list", () => {
        const html = renderToStaticMarkup(<ProfileProjectsPageBase pinned={{ state: "ready", data: [{ id: "pin", type: "external", title: "Design tokens", description: "Shared tokens", techStack: ["TypeScript"], orderIndex: 0, isVerified: false }] }} capstones={{ state: "ready", data: [capstone] }} on={{ openPinned: vi.fn(), openCapstone: vi.fn() }} />)
        expect(html.indexOf("Pinned projects")).toBeLessThan(html.indexOf("Verified capstone work"))
        expect(html).toContain("profile-project-card-grid")
        expect(html).toContain("82%")
    })

    it("rests two tiles and three capstone rows while both families are in flight", () => {
        const { container } = render(
            <ProfileProjectsPageBase
                pinned={{ state: "pending", data: [] }}
                capstones={{ state: "pending", data: [] }}
                on={{ openPinned: vi.fn(), openCapstone: vi.fn() }}
            />,
        )

        expect(container.querySelectorAll("[data-node='profile-project-card']")).toHaveLength(2)
        expect(container.querySelectorAll("[data-node='evidence-title-subtitle-fact-row']")).toHaveLength(3)
        expect(container.querySelector("[data-component='Text'][data-loading='true']")).not.toBeNull()
        expect(screen.queryByText(/selected/)).not.toBeInTheDocument()
    })

    it("gives each family its own failure sentence", () => {
        render(
            <ProfileProjectsPageBase
                pinned={{ state: "error", data: [] }}
                capstones={{ state: "error", data: [] }}
                on={{ openPinned: vi.fn(), openCapstone: vi.fn() }}
            />,
        )

        expect(screen.getByText("Pinned projects couldn't be loaded.")).toBeInTheDocument()
        expect(screen.getByText("Capstone work couldn't be loaded.")).toBeInTheDocument()
    })

    it("says nothing is pinned and nothing is verified when both settle empty", () => {
        render(
            <ProfileProjectsPageBase
                pinned={{ state: "ready", data: [] }}
                capstones={{ state: "ready", data: [] }}
                on={{ openPinned: vi.fn(), openCapstone: vi.fn() }}
            />,
        )

        expect(screen.getByText("No pinned projects yet.")).toBeInTheDocument()
        expect(screen.getByText("No verified capstone work yet.")).toBeInTheDocument()
        expect(screen.getByText("0 selected")).toBeInTheDocument()
    })

    it("follows a linked tile out and a capstone row back to its course", () => {
        const openPinned = vi.fn()
        const openCapstone = vi.fn()
        render(
            <ProfileProjectsPageBase
                pinned={{
                    state: "ready",
                    data: [{ id: "pin", type: "external", title: "Design tokens", url: "https://example.com/tokens", techStack: ["TypeScript"], orderIndex: 0, isVerified: true }],
                }}
                capstones={{ state: "ready", data: [capstone] }}
                on={{ openPinned, openCapstone }}
            />,
        )

        screen.getByRole("button", { name: "Design tokens" }).click()
        screen.getByRole("button", { name: "Frontend Engineering" }).click()
        expect(openPinned).toHaveBeenCalledWith("https://example.com/tokens")
        expect(openCapstone).toHaveBeenCalledWith("course")
        expect(screen.getByText("Verified by StarCi")).toBeInTheDocument()
    })

    it("leaves an unlinked tile unpressable and keeps its own kind badge", () => {
        const openPinned = vi.fn()
        render(
            <ProfileProjectsPageBase
                pinned={{
                    state: "ready",
                    data: [{ id: "pin", type: "case study", title: "Offline sync", description: null, techStack: [], orderIndex: 0, isVerified: false }],
                }}
                capstones={{ state: "ready", data: [{ ...capstone, totalTasks: 0, completedTasks: 0 }] }}
                on={{ openPinned, openCapstone: vi.fn() }}
            />,
        )

        expect(screen.queryByRole("button", { name: "Offline sync" })).not.toBeInTheDocument()
        expect(screen.getByText("case study")).toBeInTheDocument()
        expect(screen.getByText("0%")).toBeInTheDocument()
        expect(openPinned).not.toHaveBeenCalled()
    })
})

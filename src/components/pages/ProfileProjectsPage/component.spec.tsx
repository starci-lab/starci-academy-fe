import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ProfileProjectsBase } from "@/components/blocks/profile/ProfileProjects/component"

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
const labels = {
    pinned: "Pinned projects",
    capstones: "Verified capstone work",
    milestones: "Milestones",
    tasks: "Project tasks",
    courseKind: "Course",
    externalKind: "External project",
    openProject: "Open project",
    retry: "Try again",
    emptyPinned: "No pinned projects yet.",
    emptyCapstones: "No verified capstone work yet.",
    error: "Project evidence couldn't be loaded.",
}

describe("ProfileProjectsBase", () => {
    it("keeps pinned project tiles before the verified capstone list", () => {
        const html = renderToStaticMarkup(<ProfileProjectsBase pinned={{ state: "ready", data: [{ id: "pin", type: "external", title: "Design tokens", description: "Shared tokens", techStack: ["TypeScript"], orderIndex: 0, isVerified: false }] }} capstones={{ state: "ready", data: [capstone] }} labels={labels} on={{ openPinned: vi.fn(), openCapstone: vi.fn() }} />)
        expect(html.indexOf("Pinned projects")).toBeLessThan(html.indexOf("Verified capstone work"))
        expect(html).toContain("Milestones: 4/5")
        expect(html).toContain("Project tasks: 18/22")
        expect(html).toContain("82%")
        expect(html).toContain("role=\"progressbar\"")
    })

    it("rests two tiles and three capstone rows while both families are in flight", () => {
        const { container } = render(
            <ProfileProjectsBase
                pinned={{ state: "pending", data: [] }}
                capstones={{ state: "pending", data: [] }}
                labels={labels}
                on={{ openPinned: vi.fn(), openCapstone: vi.fn() }}
            />,
        )

        expect(container.querySelectorAll("[data-loading='true']").length).toBeGreaterThan(0)
        expect(screen.queryByText(/selected/)).not.toBeInTheDocument()
    })

    it("gives each family its own failure sentence", () => {
        const retry = vi.fn()
        render(
            <ProfileProjectsBase
                pinned={{ state: "error", data: [] }}
                capstones={{ state: "error", data: [] }}
                labels={labels}
                on={{ openPinned: vi.fn(), openCapstone: vi.fn(), retry }}
            />,
        )

        expect(screen.getAllByText("Project evidence couldn't be loaded.")).toHaveLength(2)
        screen.getAllByRole("button", { name: "Try again" }).forEach((button) => button.click())
        expect(retry).toHaveBeenCalledTimes(2)
    })

    it("says nothing is pinned and nothing is verified when both settle empty", () => {
        render(
            <ProfileProjectsBase
                pinned={{ state: "ready", data: [] }}
                capstones={{ state: "ready", data: [] }}
                labels={labels}
                on={{ openPinned: vi.fn(), openCapstone: vi.fn() }}
            />,
        )

        expect(screen.getByText("No pinned projects yet.")).toBeInTheDocument()
        expect(screen.getByText("No verified capstone work yet.")).toBeInTheDocument()
        expect(screen.queryByText("0 selected")).not.toBeInTheDocument()
        expect(screen.queryByText("External")).not.toBeInTheDocument()
    })

    it("follows a linked tile out and a capstone row back to its course", () => {
        const openPinned = vi.fn()
        const openCapstone = vi.fn()
        render(
            <ProfileProjectsBase
                pinned={{
                    state: "ready",
                    data: [{ id: "pin", type: "external", title: "Design tokens", url: "https://example.com/tokens", techStack: ["TypeScript"], orderIndex: 0, isVerified: true }],
                }}
                capstones={{ state: "ready", data: [capstone] }}
                labels={labels}
                on={{ openPinned, openCapstone }}
            />,
        )

        screen.getByRole("button", { name: "Design tokens" }).click()
        screen.getByRole("button", { name: "Frontend Engineering" }).click()
        expect(openPinned).toHaveBeenCalledWith("https://example.com/tokens")
        expect(openCapstone).toHaveBeenCalledWith("course")
        expect(screen.getByText("StarCi ✓")).toBeInTheDocument()
        expect(screen.getByText("Open project")).toBeInTheDocument()
    })

    it("leaves an unlinked tile unpressable and keeps its own kind badge", () => {
        const openPinned = vi.fn()
        render(
            <ProfileProjectsBase
                pinned={{
                    state: "ready",
                    data: [{ id: "pin", type: "case study", title: "Offline sync", description: null, techStack: [], orderIndex: 0, isVerified: false }],
                }}
                capstones={{ state: "ready", data: [{ ...capstone, totalTasks: 0, completedTasks: 0 }] }}
                labels={labels}
                on={{ openPinned, openCapstone: vi.fn() }}
            />,
        )

        expect(screen.queryByRole("button", { name: "Offline sync" })).not.toBeInTheDocument()
        expect(screen.getByText("External project")).toBeInTheDocument()
        expect(screen.getByText("0%")).toBeInTheDocument()
        expect(openPinned).not.toHaveBeenCalled()
    })

    it("keeps legacy projects with a null technology list renderable", () => {
        render(
            <ProfileProjectsBase
                pinned={{ state: "ready", data: [{ id: "legacy", type: "course", title: "Legacy project", techStack: null as unknown as ReadonlyArray<string>, orderIndex: 0, isVerified: true }] }}
                capstones={{ state: "ready", data: [] }}
                labels={labels}
                on={{ openPinned: vi.fn(), openCapstone: vi.fn() }}
            />,
        )

        expect(screen.getByText("Legacy project")).toBeInTheDocument()
        expect(screen.getByText("StarCi ✓")).toBeInTheDocument()
    })

    it("accepts route-owned project kind and action copy without leaking English literals", () => {
        render(
            <ProfileProjectsBase
                pinned={{ state: "ready", data: [{ id: "linked", type: "external", title: "Sổ tay quan sát", url: "https://example.com", techStack: [], orderIndex: 0, isVerified: false }] }}
                capstones={{ state: "ready", data: [] }}
                labels={{ ...labels, externalKind: "Dự án ngoài", openProject: "Mở dự án", retry: "Thử lại" }}
                on={{ openPinned: vi.fn(), openCapstone: vi.fn() }}
            />,
        )

        expect(screen.getByText("Dự án ngoài")).toBeInTheDocument()
        expect(screen.getByText("Mở dự án")).toBeInTheDocument()
        expect(screen.queryByText("External project")).not.toBeInTheDocument()
    })
})

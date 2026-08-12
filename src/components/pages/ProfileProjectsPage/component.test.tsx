import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { _ProfileProjectsPage } from "./component"

describe("_ProfileProjectsPage", () => {
    it("keeps pinned project tiles before the verified capstone list", () => {
        const html = renderToStaticMarkup(<_ProfileProjectsPage pinned={{ state: "ready", data: [{ id: "pin", type: "external", title: "Design tokens", description: "Shared tokens", techStack: ["TypeScript"], orderIndex: 0, isVerified: false }] }} capstones={{ state: "ready", data: [{ courseGlobalId: "course", courseTitle: "Frontend Engineering", totalMilestones: 5, completedMilestones: 4, totalTasks: 22, completedTasks: 18, milestones: [] }] }} on={{ openPinned: vi.fn(), openCapstone: vi.fn() }} />)
        expect(html.indexOf("Pinned projects")).toBeLessThan(html.indexOf("Verified capstone work"))
        expect(html).toContain("profile-project-card-grid")
        expect(html).toContain("82%")
    })
})

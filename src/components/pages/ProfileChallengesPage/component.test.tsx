import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { _ProfileChallengesPage } from "./component"

describe("_ProfileChallengesPage", () => {
    it("renders headline strength before passed submission proof", () => {
        const html = renderToStaticMarkup(<_ProfileChallengesPage strength={{ state: "ready", data: { percentile: 12, rank: 214, xp: 1840 } }} submissions={{ state: "ready", data: [{ id: "submission", title: "Resilient checkout", selectedLang: "TypeScript", courseTitle: "Frontend Engineering", courseGlobalId: "course", passedAt: "2026-07-28", score: 94 }] }} on={{ openCourse: vi.fn() }} />)
        expect(html.indexOf("Challenge strength")).toBeLessThan(html.indexOf("Passed submissions"))
        expect(html).toContain("Top 12%")
        expect(html).toContain("Resilient checkout")
    })
})

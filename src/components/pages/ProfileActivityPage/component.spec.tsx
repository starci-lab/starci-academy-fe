import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ProfileActivityPageBase } from "./component"

describe("ProfileActivityPageBase", () => {
    it("keeps earned achievements before day-grouped activity", () => {
        const { container } = render(<ProfileActivityPageBase achievementState="ready" achievements={[{ slug: "builder", name: "30 Day Builder", earned: true, currentValue: 30, threshold: 30, rarityPercent: 2.1 }]} feed={{ state: "ready", props: { message: "No activity", days: [{ id: "today", label: "Today", rows: [{ id: "event", actor: "linh", action: "solved", target: "Shortest path", time: "2h" }] }] } }} />)
        const text = container.textContent ?? ""
        expect(text.indexOf("30 Day Builder")).toBeLessThan(text.indexOf("Today"))
        expect(container.querySelector("[data-node='profile-achievement-grid']")).toBeInTheDocument()
        expect(container.querySelector("[data-node='activity-day-group']")).toBeInTheDocument()
        expect(container.querySelector("[data-component='ProfileEvidenceSection']")).toBeNull()
    })
})

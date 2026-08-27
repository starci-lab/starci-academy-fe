import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ProfileActivityBase } from "@/components/blocks/profile/ProfileActivity/component"

describe("ProfileActivityBase", () => {
    it("keeps earned achievements before day-grouped activity", () => {
        const { container } = render(<ProfileActivityBase achievementState="ready" achievements={[{ slug: "builder", name: "30 Day Builder", earned: true, currentValue: 30, threshold: 30, rarityPercent: 2.1 }]} feed={{ state: "ready", props: { message: "No activity", days: [{ id: "today", label: "Today", rows: [{ id: "event", actor: "linh", action: "solved", target: "Shortest path", time: "2h" }] }] } }} />)
        const text = container.textContent ?? ""
        expect(text.indexOf("30 Day Builder")).toBeLessThan(text.indexOf("Today"))
        expect(screen.getByText("Earned achievements")).toBeInTheDocument()
        expect(screen.getByText("Activity")).toBeInTheDocument()
        expect(screen.getByText("Today")).toBeInTheDocument()
    })
})

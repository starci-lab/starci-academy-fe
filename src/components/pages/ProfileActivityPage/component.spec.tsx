import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProfileActivityBase, profileActivityDayLabel, profileActivityTimeLabel } from "@/components/blocks/profile/ProfileActivity/component"

describe("ProfileActivityBase", () => {
    it("formats public chronology with the route locale instead of English browser defaults", () => {
        const at = "2026-09-01T01:44:00+07:00"

        expect(profileActivityDayLabel(at, "vi")).not.toMatch(/Sep|Aug/)
        expect(profileActivityTimeLabel(at, "vi")).not.toMatch(/AM|PM/)
        expect(profileActivityDayLabel(at, "en")).toMatch(/Sep/)
    })
    it("leads with momentum, then day-grouped activity and supporting achievements", () => {
        const { container } = render(<ProfileActivityBase achievementState="ready" achievements={[{ slug: "builder", name: "30 Day Builder", earned: true, currentValue: 30, threshold: 30, rarityPercent: 2.1 }]} feed={{ state: "ready", props: { message: "No activity", days: [{ id: "today", label: "Today", rows: [{ id: "event", actor: "linh", action: "solved", target: "Shortest path", time: "2h" }] }] } }} />)
        const text = container.textContent ?? ""
        expect(text.indexOf("Recent activity")).toBeLessThan(text.indexOf("Today"))
        expect(text.indexOf("Today")).toBeLessThan(text.indexOf("30 Day Builder"))
        expect(screen.getAllByText("Achievements").length).toBeGreaterThan(0)
        expect(screen.getByText("Learning timeline")).toBeInTheDocument()
        expect(screen.getByText("Today")).toBeInTheDocument()
        expect(screen.getByText("Rarity 2.1%")).toBeInTheDocument()
    })

    it("keeps the public activity empty state labelled once and offers course discovery", () => {
        const browseCourses = vi.fn()
        render(<ProfileActivityBase achievementState="ready" achievements={[]} feed={{ state: "platformEmpty", props: { label: "Activity", message: "No public activity yet.", actionLabel: "Browse courses", days: [] }, on: { resultAction: browseCourses } }} />)

        expect(screen.getAllByText("Activity")).toHaveLength(1)
        expect(screen.getByText("Timeline status")).toBeInTheDocument()
        expect(screen.getByText("Recent activity").previousSibling).toHaveTextContent("0")
        fireEvent.click(screen.getByRole("button", { name: "Browse courses" }))
        expect(browseCourses).toHaveBeenCalledOnce()
    })
})

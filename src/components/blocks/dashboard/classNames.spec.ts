import { describe, expect, it } from "vitest"
import { dashboardAccentBandClassName, dashboardNeutralBandClassName } from "./classNames"

describe("dashboard shared band semantics", () => {
    it("does not let an accent-soft background overwrite descendant text roles", () => {
        expect(dashboardAccentBandClassName).toContain("bg-accent-soft")
        expect(dashboardAccentBandClassName).not.toContain("[&_[data-size=sm]]")
        expect(dashboardAccentBandClassName).not.toContain("[&_[data-size=xs]]")
    })

    it("keeps neutral summaries on the secondary surface", () => {
        expect(dashboardNeutralBandClassName).toContain("bg-surface-secondary")
        expect(dashboardNeutralBandClassName).toContain("text-foreground")
    })
})

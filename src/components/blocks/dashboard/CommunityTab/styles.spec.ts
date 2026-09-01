import { describe, expect, it } from "vitest"
import {
    communityActionRowClassName,
    communityLeagueStandingClassName,
    communityTopStandingClassName,
} from "./classNames"

describe("CommunityTab styles", () => {
    it("keeps both standings on one secondary surface with shared foreground copy", () => {
        expect(communityLeagueStandingClassName).toContain("bg-surface-secondary")
        expect(communityTopStandingClassName).toContain("bg-surface-secondary")
        expect(communityLeagueStandingClassName).toContain("text-foreground")
        expect(communityLeagueStandingClassName).not.toContain("text-accent-soft-foreground")
        expect(communityTopStandingClassName).toContain("text-foreground")
        expect(communityTopStandingClassName).not.toContain("bg-accent-soft")
    })

    it("owns one trailing action row below the ranking cards", () => {
        expect(communityActionRowClassName).toContain("w-full")
        expect(communityActionRowClassName).toContain("justify-end")
    })
})

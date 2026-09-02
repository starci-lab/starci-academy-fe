import { describe, expect, it } from "vitest"
import {
    communityActionRowClassName,
    communityCardsClassName,
    communityDestinationLinkClassName,
    communityLeagueStandingClassName,
    communityRankedRowClassName,
    communityStandingClassName,
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
        expect(communityCardsClassName).toContain("gap-6")
        expect(communityActionRowClassName).toContain("w-full")
        expect(communityActionRowClassName).toContain("justify-end")
        expect(communityDestinationLinkClassName).toContain("button--primary")
    })

    it("uses outer-edge and divider-edge padding for joined leaderboard blocks", () => {
        expect(communityStandingClassName).toContain("pt-4")
        expect(communityStandingClassName).toContain("pb-3")
        expect(communityRankedRowClassName).toContain("py-3")
        expect(communityRankedRowClassName).toContain("last:pb-4")
    })
})

import { describe, expect, it, vi } from "vitest"
import * as hooks from "./index"

/**
 * What these tests guard: the barrel's ROSTER and its narrowness.
 *
 * Every block imports `@/hooks` and every block test replaces this exact module, so the
 * barrel is a published contract between two halves of the app that are written by different
 * hands. A hook missing from it fails as `undefined is not a function` inside a component
 * that looks correct; a hook renamed in it fails the same way. Both are cheap to catch here
 * and expensive to catch there.
 *
 * The transport is mocked away so importing the barrel - which pulls in every query module
 * behind it - cannot reach the network from a unit test.
 */

vi.mock("../modules/api/graphql/clients/create-apollo-client", () => ({
    createApolloClient: vi.fn(() => ({ query: vi.fn() })),
}))

/** Every hook the app's blocks are entitled to import from `@/hooks`. */
const EXPECTED = [
    "useQueryAutocompleteGlobalSearchSwr",
    "useMutateAddToCartSwr",
    "useMutateRemoveFromCartSwr",
    "useMutateStartTrialSwr",
    "useMutateClearCartSwr",
    "useQueryMyCartSwr",
    "useQueryCoursesCheckoutPreviewSwr",
    "useMutateCoursesCheckoutSwr",
    "useQueryCoursePricePreviewSwr",
    "useQueryCourseReviewsSwr",
    "useQueryCoursesSwr",
    "useQueryCourseSwr",
    "useQueryMeSwr",
    "useMutateSignOutSwr",
    "useQueryPlatformStatsSwr",
    "useQueryMyCoursesSwr",
    "useQueryMyWeeklyStatsSwr",
    "useQueryMyAiQuotaSwr",
    "useQueryMyRewardWalletSwr",
    "useQueryMyDailyQuestSwr",
    "useQueryMyKpisSwr",
    "useQueryMyLearnedLessonsSwr",
    "useQueryMyInProgressChallengesSwr",
    "useQueryMyJobReadinessSwr",
    "useQueryWeeklyChallengeSwr",
    "useQueryMyContributionCalendarSwr",
    "useQueryChangelogEntriesSwr",
    "useMutateClaimWeeklyChallengeRewardSwr",
    "useMutateRedeemRewardSwr",
    "useMutateReactActivitySwr",
    "useMutateSetFollowSwr",
    "useQueryMyFeedSwr",
    "useQueryTrendingContentsSwr",
    "useQuerySuggestedUsersSwr",
    "useQueryResolveRouteSwr",
    "useQueryRecommendedCoursesSwr",
    "useQueryMyUpcomingLivestreamsSwr",
    "useQueryMyLeagueSwr",
    "useQueryGlobalLeaderboardSwr",
    "useQueryContentAiSessionsSwr",
    "useQueryContentAiHistorySwr",
    "useMutateCreateContentAiSessionSwr",
    "useMutateRenameContentAiSessionSwr",
    "useMutateSetContentAiSessionArchivedSwr",
    "useMutateDeleteContentAiSessionSwr",
    "useMutateTouchContentAiSessionSwr",
    "useContentAiStream",
]

describe("hooks barrel", () => {
    it("exports every hook a block imports", () => {
        for (const name of EXPECTED) {
            expect(Object.keys(hooks)).toContain(name)
        }
    })

    it("exports that roster and NOTHING else", () => {
        expect(Object.keys(hooks).sort()).toEqual([...EXPECTED].sort())
    })

    it("exports functions, not values that merely happen to exist", () => {
        for (const name of EXPECTED) {
            expect(hooks[name as keyof typeof hooks]).toBeTypeOf("function")
        }
    })

    it("leaks no cache key, type or query module through the barrel", () => {
        const leaked = Object.keys(hooks).filter((name) => !/^use(Query|Mutate)|^useContentAiStream$/.test(name))
        expect(leaked).toEqual([])
    })
})

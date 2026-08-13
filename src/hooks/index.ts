/**
 * The hook barrel - the ONE door a component uses to read data.
 *
 * A block imports `@/hooks`, never `@/hooks/swr/useQuerySomethingSwr`. That is not tidiness:
 * it is what makes a block testable. Every block test replaces this module wholesale with
 * `vi.mock("@/hooks", ...)`, and a block that reached past the barrel to a file path would
 * quietly escape that mock and try to reach the network from a unit test.
 *
 * Hooks ONLY. Types, cache keys and query modules stay behind their own paths, because the
 * moment a barrel also re-exports types, a component that wanted one type starts pulling the
 * whole data layer into its module graph.
 */

export { useQueryCoursesSwr } from "./swr/useQueryCoursesSwr"
export { useQueryCourseSwr } from "./swr/useQueryCourseSwr"
export { useQueryPlatformStatsSwr } from "./swr/useQueryPlatformStatsSwr"
export { useQueryMyCoursesSwr } from "./swr/useQueryMyCoursesSwr"
export { useQueryMyWeeklyStatsSwr } from "./swr/useQueryMyWeeklyStatsSwr"
export { useQueryMyAiQuotaSwr } from "./swr/useQueryMyAiQuotaSwr"
export { useQueryMeSwr } from "./swr/useQueryMeSwr"
export { useQueryMyRewardWalletSwr } from "./swr/useQueryMyRewardWalletSwr"
export { useQueryMyDailyQuestSwr } from "./swr/useQueryMyDailyQuestSwr"
export { useQueryMyKpisSwr } from "./swr/useQueryMyKpisSwr"
export { useQueryMyLearnedLessonsSwr } from "./swr/useQueryMyLearnedLessonsSwr"
export { useQueryMyInProgressChallengesSwr } from "./swr/useQueryMyInProgressChallengesSwr"
export { useQueryMyJobReadinessSwr } from "./swr/useQueryMyJobReadinessSwr"
export { useQueryWeeklyChallengeSwr } from "./swr/useQueryWeeklyChallengeSwr"
export { useQueryMyContributionCalendarSwr } from "./swr/useQueryMyContributionCalendarSwr"
export { useQueryChangelogEntriesSwr } from "./swr/useQueryChangelogEntriesSwr"
export { useMutateClaimWeeklyChallengeRewardSwr } from "./swr/useMutateClaimWeeklyChallengeRewardSwr"
export { useMutateRedeemRewardSwr } from "./swr/useMutateRedeemRewardSwr"
export { useQueryMyFeedSwr } from "./swr/useQueryMyFeedSwr"
export { useQueryTrendingContentsSwr } from "./swr/useQueryTrendingContentsSwr"
export { useQuerySuggestedUsersSwr } from "./swr/useQuerySuggestedUsersSwr"
export { useQueryResolveRouteSwr } from "./swr/useQueryResolveRouteSwr"
export { useMutateReactActivitySwr } from "./swr/useMutateReactActivitySwr"
export { useMutateSetFollowSwr } from "./swr/useMutateSetFollowSwr"
export { useQueryRecommendedCoursesSwr } from "./swr/useQueryRecommendedCoursesSwr"
export { useQueryMyUpcomingLivestreamsSwr } from "./swr/useQueryMyUpcomingLivestreamsSwr"
export { useQueryMyLeagueSwr } from "./swr/useQueryMyLeagueSwr"
export { useQueryGlobalLeaderboardSwr } from "./swr/useQueryGlobalLeaderboardSwr"

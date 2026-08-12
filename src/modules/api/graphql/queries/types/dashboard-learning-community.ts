import type { GraphQLResponse } from "../../types"

/** Identifies the pricing rule applied to a recommended course. */
export type DiscountReason = "none" | "new_learner" | "returning_learner" | "loyal_learner" | string
/** Describes one personalized course recommendation. */
export type RecommendedCourse = { readonly displayId: string; readonly title: string; readonly description: string | null; readonly thumbnailUrl: string | null; readonly originalPriceVnd: number; readonly discountedPriceVnd: number; readonly discountPercent: number; readonly discountReason: DiscountReason; readonly enrolledCount: number }
/** Models the recommended-courses GraphQL response. */
export interface QueryRecommendedCoursesResponse { recommendedCourses: GraphQLResponse<{ items: Array<RecommendedCourse> }> }

/** Describes the next livestream session available to the learner. */
export type UpcomingLivestream = { readonly courseGlobalId: string; readonly courseTitle: string; readonly courseDisplayId: string; readonly sessionTitle: string | null; readonly nextStartAt: string; readonly nextEndAt: string | null }
/** Models the upcoming-livestreams GraphQL response. */
export interface QueryMyUpcomingLivestreamsResponse { myUpcomingLivestreams: GraphQLResponse<Array<UpcomingLivestream>> }

/** Describes one learner standing in the current league. */
export type LeagueEntry = { readonly userGlobalId: string; readonly username: string | null; readonly avatar: string | null; readonly weekPoints: number; readonly rank: number; readonly rankDelta: number | null }
/** Describes the current learner league and its promotion boundaries. */
export type MyLeague = { readonly tier: string; readonly weekEndAt: string; readonly promoteCount: number; readonly demoteCount: number; readonly entries: Array<LeagueEntry> }
/** Models the current-league GraphQL response. */
export interface QueryMyLeagueResponse { myLeague: GraphQLResponse<MyLeague> }

/** Describes one ranked learner and the viewer's follow state. */
export type GlobalLeaderboardEntry = { readonly userGlobalId: string; readonly username: string | null; readonly avatar: string | null; readonly points: number; readonly rank: number; readonly isFollowing: boolean }
/** Describes global standings together with the current learner's rank. */
export type GlobalLeaderboard = { readonly entries: Array<GlobalLeaderboardEntry>; readonly myRank: number; readonly myPoints: number }
/** Models the global-leaderboard GraphQL response. */
export interface QueryGlobalLeaderboardResponse { globalLeaderboard: GraphQLResponse<GlobalLeaderboard> }

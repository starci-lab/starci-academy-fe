import { type GraphQLResponse } from "../../types"

/**
 * The public counters shown on the landing page.
 *
 * Every field is a whole number the back end already aggregates. Nothing here is derived on
 * the client, and nothing here has a fallback: a counter the server cannot produce is absent
 * rather than invented, because a made-up number on a landing page is a claim, not a
 * placeholder.
 */
export interface PlatformStatsData {
    /** Distinct learners enrolled in at least one course. */
    totalLearners: number
    /** Content units across every course. */
    totalLessons: number
    /** Courses available on the platform. */
    totalCourses: number
    /** Badges earned by all learners together. */
    totalBadgesEarned: number
}

/** The response shape of the `platformStats` query, envelope included. */
export interface QueryPlatformStatsResponse {
    /** The top-level field, wrapping the standard envelope. */
    platformStats: GraphQLResponse<PlatformStatsData>
}

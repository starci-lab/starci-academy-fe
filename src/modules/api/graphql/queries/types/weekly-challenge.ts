import { type GraphQLResponse } from "../../types"

/** One learner who passed the featured challenge. */
export type WeeklyChallengeLeaderboardEntry = {
    readonly username: string
    readonly avatar: string | null
    readonly passedAt: string
}

/** Featured weekly challenge plus the authenticated viewer's state. */
export type WeeklyChallengeData = {
    readonly challengeGlobalId: string
    readonly title: string
    readonly weekEndAt: string
    readonly viewerPassed: boolean
    readonly passedCount: number
    readonly leaderboard: Array<WeeklyChallengeLeaderboardEntry>
    readonly claimed: boolean
    readonly coinReward: number | null
}

/** Standard GraphQL envelope returned by the weekly challenge query. */
export type QueryWeeklyChallengeResponse = {
    readonly weeklyChallenge: GraphQLResponse<WeeklyChallengeData | null>
}

import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"

/** One enrollment in the cached course ranking window. */
export interface CourseLeaderboardEntry {
    readonly rank: number
    readonly enrollmentId: string
    readonly userId: string
    readonly username: string | null
    readonly avatar: string | null
    readonly totalScore: number
    readonly completedChallenges: number
    readonly lessonsRead: number
    readonly milestoneProgress: number
    readonly totalXp: number
}

/** The viewer's course standing, including viewers outside the returned top window. */
export type CourseLeaderboardMyRank = Pick<
    CourseLeaderboardEntry,
    "rank" | "totalScore" | "completedChallenges" | "lessonsRead" | "milestoneProgress" | "totalXp"
>

/** The server-computed course leaderboard snapshot. */
export interface CourseLeaderboard {
    readonly courseId: string
    readonly totalChallenges: number
    readonly maxPossibleScore: number
    readonly entries: ReadonlyArray<CourseLeaderboardEntry>
    readonly myRank: CourseLeaderboardMyRank | null
    readonly computedAt: string
}

interface QueryCourseLeaderboardRequest {
    readonly courseId: string
    readonly limit?: number
}

interface QueryCourseLeaderboardResponse {
    readonly courseLeaderboard: GraphQLResponse<CourseLeaderboard>
}

const query1 = gql`
    query CourseLeaderboard($request: LeaderboardRequest!) {
        courseLeaderboard(request: $request) {
            success
            message
            error
            data {
                courseId
                totalChallenges
                maxPossibleScore
                computedAt
                myRank {
                    rank
                    totalScore
                    completedChallenges
                    lessonsRead
                    milestoneProgress
                    totalXp
                }
                entries {
                    rank
                    enrollmentId
                    userId
                    username
                    avatar
                    totalScore
                    completedChallenges
                    lessonsRead
                    milestoneProgress
                    totalXp
                }
            }
        }
    }
`

/** Selects one course leaderboard in the shared GraphQL executor. */
export enum QueryCourseLeaderboard { Query1 = "query1" }

const queryCourseLeaderboardMap: Record<QueryCourseLeaderboard, DocumentNode> = {
    [QueryCourseLeaderboard.Query1]: query1,
}

/** Reads the authenticated viewer-relative snapshot for one course. */
export const queryCourseLeaderboard = async ({
    query = QueryCourseLeaderboard.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryCourseLeaderboard, QueryCourseLeaderboardRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryCourseLeaderboardResponse>({
        query: queryCourseLeaderboardMap[query],
        variables: { request },
    })
}

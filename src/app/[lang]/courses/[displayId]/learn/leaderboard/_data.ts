import { gql } from "@apollo/client"
import { createApolloClient } from "@/modules/api/graphql/clients/create-apollo-client"

/** One ranked learner returned by the course leaderboard snapshot. */
export type CourseLeaderboardEntry = {
    rank: number
    enrollmentId: string
    userId: string
    username: string | null
    avatar: string | null
    totalScore: number
    completedChallenges: number
    lessonsRead: number
    milestoneProgress: number
    totalXp: number
}

/** The viewer's standing, returned even when outside the visible top window. */
export type CourseLeaderboardMyRank = Omit<CourseLeaderboardEntry, "rank" | "enrollmentId" | "userId" | "username" | "avatar"> & { rank: number }

/** The cached course leaderboard payload used by the learn route. */
export type CourseLeaderboard = {
    courseId: string
    entries: Array<CourseLeaderboardEntry>
    myRank: CourseLeaderboardMyRank | null
    computedAt: string
}

type CourseResponse = { course: { data: { id: string; title: string; isEnrolled?: boolean | null } | null } }
type LeaderboardResponse = { courseLeaderboard: { data: CourseLeaderboard | null } }

const courseQuery = gql`
    query LearnLeaderboardCourse($request: CourseRequest!) {
        course(request: $request) { data { id title isEnrolled } }
    }
`

const leaderboardQuery = gql`
    query LearnCourseLeaderboard($request: LeaderboardRequest!) {
        courseLeaderboard(request: $request) {
            data { courseId computedAt myRank { rank totalScore completedChallenges lessonsRead milestoneProgress totalXp }
                entries { rank enrollmentId userId username avatar totalScore completedChallenges lessonsRead milestoneProgress totalXp } }
        }
    }
`

/** Resolve the course id, then load its canonical leaderboard snapshot. */
export const loadCourseLeaderboard = async (displayId: string) => {
    const client = createApolloClient({ withAuth: true })
    const course = await client.query<CourseResponse>({ query: courseQuery, variables: { request: { displayId } } })
    const courseData = course.data?.course?.data
    if (!courseData) return null
    const board = await client.query<LeaderboardResponse>({
        query: leaderboardQuery,
        variables: { request: { courseId: courseData.id, limit: 100 } },
    })
    return { course: courseData, board: board.data?.courseLeaderboard?.data ?? null }
}

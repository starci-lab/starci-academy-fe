import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLHeaders } from "../types"
import { queryCourse } from "./query-course"
import type { QueryCourseOutlineResponse } from "./types/course-outline"

const courseOutlineQuery = gql`
    query CourseOutline($request: MyCourseOutlineRequest!) {
        myCourseOutline(request: $request) {
            success
            message
            error
            data {
                course { id title displayId }
                modules {
                    id
                    title
                    orderIndex
                    isPremium
                    lessons {
                        id
                        displayId
                        title
                        minutesRead
                        difficulty
                        isPremium
                        isRead
                        challenges { id title difficulty maxScore status lastScore completed }
                    }
                }
                milestones {
                    id
                    title
                    orderIndex
                    tasks { id title type maxScore completed lastScore numAttempts }
                }
                progress {
                    lessonsRead
                    lessonsTotal
                    challengesCompleted
                    challengesTotal
                    tasksCompleted
                    tasksTotal
                    completionPercent
                }
                currentTask { kind id milestoneId }
                nextContentTask { kind id milestoneId }
            }
        }
    }
`

/** Transport options shared by the display-id lookup and private outline request. */
export type CourseOutlineTransportOptions = {
    readonly headers?: GraphQLHeaders
    readonly signal?: AbortSignal
    readonly debug?: boolean
}

/** Resolve a display id, then read the authenticated viewer's complete course outline. */
export const queryCourseOutline = async (
    displayId: string,
    options: CourseOutlineTransportOptions = {},
) => {
    const course = await queryCourse({ request: { displayId }, ...options })
    const courseId = course.data?.course?.data?.id
    if (courseId === undefined) return null

    const apollo = createApolloClient({ withAuth: true, ...options })
    const result = await apollo.query<QueryCourseOutlineResponse>({
        query: courseOutlineQuery,
        variables: { request: { courseId } },
    })
    return result.data?.myCourseOutline?.data ?? null
}

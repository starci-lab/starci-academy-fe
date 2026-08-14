import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { queryCourse } from "./query-course"
import type { GraphQLHeaders } from "../types"
import type {
    QueryCoursePersonalProjectResponse,
    QueryPersonalTaskAttemptFeedbacksRequest,
    QueryPersonalTaskAttemptFeedbacksResponse,
    QueryPersonalTaskAttemptsRequest,
    QueryPersonalTaskAttemptsResponse,
    SubmitPersonalTaskAttemptRequest,
    SubmitPersonalTaskAttemptResponse,
} from "./types/course-personal-project"

const coursePersonalProjectQuery = gql`
    query CoursePersonalProject($request: MyCourseOutlineRequest!) {
        myCourseOutline(request: $request) {
            success
            message
            error
            data {
                course { id title displayId }
                milestones {
                    id
                    title
                    orderIndex
                    tasks { id title type maxScore completed lastScore }
                }
                progress { tasksCompleted tasksTotal completionPercent }
                currentTask { kind id milestoneId }
            }
        }
    }
`

const personalTaskAttemptsQuery = gql`
    query PersonalTaskAttempts($request: UserPersonalTaskAttemptsRequest!) {
        userPersonalTaskAttempts(request: $request) {
            success
            message
            error
            data {
                count
                data {
                    id
                    attemptNumber
                    passed
                    score
                    shortFeedback
                    processedAt
                    servedModel
                    servedProvider
                }
            }
        }
    }
`

const personalTaskAttemptFeedbacksQuery = gql`
    query PersonalTaskAttemptFeedbacks($request: UserPersonalTaskAttemptFeedbacksRequest!) {
        userPersonalTaskAttemptFeedbacks(request: $request) {
            success
            message
            error
            data {
                count
                data { id message severity sortIndex location suggestion }
            }
        }
    }
`

const submitPersonalTaskAttemptMutation = gql`
    mutation SubmitPersonalTaskAttempt($request: ReviewPersonalProjectTaskRequest!) {
        reviewPersonalProjectTask(request: $request) {
            success
            message
            error
            data { jobId }
        }
    }
`

/** Shared authenticated Apollo options for the personal-project operation family. */
export type PersonalProjectTransportOptions = {
    readonly headers?: GraphQLHeaders
    readonly signal?: AbortSignal
    readonly debug?: boolean
}

/** Resolves a display id to a course id, then reads its viewer-specific outline. */
export const queryCoursePersonalProject = async (
    displayId: string,
    options: PersonalProjectTransportOptions = {},
) => {
    const course = await queryCourse({ request: { displayId }, ...options })
    const courseId = course.data?.course?.data?.id
    if (courseId === undefined) return null
    const apollo = createApolloClient({ withAuth: true, ...options })
    const result = await apollo.query<QueryCoursePersonalProjectResponse>({
        query: coursePersonalProjectQuery,
        variables: { request: { courseId } },
    })
    return result.data?.myCourseOutline?.data ?? null
}

/** Reads newest-first task attempts for the authenticated learner. */
export const queryPersonalTaskAttempts = async (
    request: QueryPersonalTaskAttemptsRequest,
    options: PersonalProjectTransportOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.query<QueryPersonalTaskAttemptsResponse>({
        query: personalTaskAttemptsQuery,
        variables: { request },
    })
}

/** Reads ordered feedback rows for one graded task attempt. */
export const queryPersonalTaskAttemptFeedbacks = async (
    request: QueryPersonalTaskAttemptFeedbacksRequest,
    options: PersonalProjectTransportOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.query<QueryPersonalTaskAttemptFeedbacksResponse>({
        query: personalTaskAttemptFeedbacksQuery,
        variables: { request },
    })
}

/** Enqueues backend review for one personal-project task. */
export const mutateSubmitPersonalTaskAttempt = async (
    request: SubmitPersonalTaskAttemptRequest,
    options: PersonalProjectTransportOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<SubmitPersonalTaskAttemptResponse>({
        mutation: submitPersonalTaskAttemptMutation,
        variables: { request },
    })
}

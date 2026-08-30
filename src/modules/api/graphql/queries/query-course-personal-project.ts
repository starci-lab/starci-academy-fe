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
    QueryPersonalProjectGradingModelsResponse,
    QueryPersonalProjectRepositoryResponse,
    QueryPersonalProjectTaskResponse,
    SubmitPersonalTaskAttemptRequest,
    SubmitPersonalTaskAttemptResponse,
    SyncPersonalProjectGithubRequest,
    SyncPersonalProjectGithubResponse,
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
                    tasks { id title type maxScore completed lastScore numAttempts }
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

const personalProjectTaskQuery = gql`
    query PersonalProjectTask($request: TaskRequest!) {
        task(request: $request) {
            success
            message
            error
            data {
                id
                displayId
                title
                description
                hint
                type
                maxScore
                difficulty
                verified
                criterias { id text hint orderIndex score }
                briefs { id lang body orderIndex }
                codeImplementations { id lang guide example orderIndex }
            }
        }
    }
`

const personalProjectRepositoryQuery = gql`
    query PersonalProjectRepository($request: CourseEnrollmentStatusRequest!) {
        courseEnrollmentStatus(request: $request) {
            success
            message
            error
            data {
                isEnrolled
                enrollment {
                    personalProjectGithubUrl
                    personalProjectGithubBranch
                    personalProjectGithubTokenLast4
                }
            }
        }
    }
`

const personalProjectGradingModelsQuery = gql`
    query PersonalProjectGradingModels {
        aiModels {
            success
            message
            error
            data {
                gradableModels {
                    model
                    provider
                    category
                    complimentary
                    available
                    supportedTasks
                }
            }
        }
    }
`

const syncPersonalProjectGithubMutation = gql`
    mutation SyncPersonalProjectGithub($request: SyncPersonalProjectGithubRequest!) {
        syncPersonalProjectGithub(request: $request) {
            success
            message
            error
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
    const apollo = createApolloClient({
        withAuth: true,
        ...options,
        headers: { "X-Course-Id": request.courseId, ...options.headers },
    })
    return apollo.mutate<SubmitPersonalTaskAttemptResponse>({
        mutation: submitPersonalTaskAttemptMutation,
        variables: { request },
    })
}

/** Reads the complete authored task document used by the project workspace. */
export const queryPersonalProjectTask = async (
    taskId: string,
    courseId: string,
    options: PersonalProjectTransportOptions = {},
) => {
    const apollo = createApolloClient({
        withAuth: true,
        ...options,
        headers: { "X-Course-Id": courseId, ...options.headers },
    })
    return apollo.query<QueryPersonalProjectTaskResponse>({
        query: personalProjectTaskQuery,
        variables: { request: { id: taskId } },
    })
}

/** Reads the current enrollment's repository settings without exposing its token. */
export const queryPersonalProjectRepository = async (
    courseId: string,
    options: PersonalProjectTransportOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.query<QueryPersonalProjectRepositoryResponse>({
        query: personalProjectRepositoryQuery,
        variables: { request: { courseId } },
    })
}

/** Reads live grading-model choices and their availability. */
export const queryPersonalProjectGradingModels = async (
    options: PersonalProjectTransportOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.query<QueryPersonalProjectGradingModelsResponse>({
        query: personalProjectGradingModelsQuery,
    })
}

/** Persists repository, branch or private-token settings on the enrollment. */
export const mutateSyncPersonalProjectGithub = async (
    request: SyncPersonalProjectGithubRequest,
    options: PersonalProjectTransportOptions = {},
) => {
    const apollo = createApolloClient({
        withAuth: true,
        ...options,
        headers: { "X-Course-Id": request.courseId, ...options.headers },
    })
    return apollo.mutate<SyncPersonalProjectGithubResponse>({
        mutation: syncPersonalProjectGithubMutation,
        variables: { request },
    })
}

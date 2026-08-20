import type { GraphQLResponse } from "../../types"

/** Viewer-specific progress fields for one capstone task. */
export type PersonalProjectTask = {
    readonly id: string
    readonly title: string
    readonly type: string | null
    readonly maxScore: number
    readonly completed: boolean
    readonly lastScore: number
    readonly numAttempts: number
}

/** Ordered milestone and its personal-project tasks. */
export type PersonalProjectMilestone = {
    readonly id: string
    readonly title: string
    readonly orderIndex: number
    readonly tasks: ReadonlyArray<PersonalProjectTask>
}

/** Course identity, capstone outline, aggregate progress and resume pointer. */
export type CoursePersonalProject = {
    readonly course: { readonly id: string; readonly title: string; readonly displayId: string }
    readonly milestones: ReadonlyArray<PersonalProjectMilestone>
    readonly progress: {
        readonly tasksCompleted: number
        readonly tasksTotal: number
        readonly completionPercent: number
    }
    readonly currentTask: {
        readonly kind: string
        readonly id: string
        readonly milestoneId: string | null
    } | null
}

/** One graded personal-project submission attempt. */
export type PersonalTaskAttempt = {
    readonly id: string
    readonly attemptNumber: number
    readonly passed: boolean
    readonly score: number
    readonly shortFeedback?: string | null
    readonly processedAt?: string | null
    readonly servedModel?: string | null
    readonly servedProvider?: string | null
}

/** One ordered structured-feedback row for a graded attempt. */
export type PersonalTaskAttemptFeedback = {
    readonly id: string
    readonly message: string
    readonly severity?: string | null
    readonly sortIndex: number
    readonly location?: string | null
    readonly suggestion?: string | null
}

/** GraphQL envelope returned by the course outline query. */
export type QueryCoursePersonalProjectResponse = {
    readonly myCourseOutline: GraphQLResponse<CoursePersonalProject>
}

/** Newest-first page request for one task's attempts. */
export type QueryPersonalTaskAttemptsRequest = {
    readonly courseId: string
    readonly taskId: string
    readonly filters: {
        readonly pageNumber: number
        readonly limit: number
        readonly sorts: ReadonlyArray<{ readonly by: "attemptNumber"; readonly order: "DESC" }>
    }
}

/** GraphQL page envelope for personal-task attempts. */
export type QueryPersonalTaskAttemptsResponse = {
    readonly userPersonalTaskAttempts: GraphQLResponse<{
        readonly count: number
        readonly data: ReadonlyArray<PersonalTaskAttempt>
    }>
}

/** Authored-order page request for one attempt's feedback. */
export type QueryPersonalTaskAttemptFeedbacksRequest = {
    readonly attemptId: string
    readonly filters: {
        readonly pageNumber: number
        readonly limit: number
        readonly sorts: ReadonlyArray<{ readonly by: "sortIndex"; readonly order: "ASC" }>
    }
}

/** GraphQL page envelope for attempt feedback rows. */
export type QueryPersonalTaskAttemptFeedbacksResponse = {
    readonly userPersonalTaskAttemptFeedbacks: GraphQLResponse<{
        readonly count: number
        readonly data: ReadonlyArray<PersonalTaskAttemptFeedback>
    }>
}

/** Minimal backend-proven request for one task review. */
export type SubmitPersonalTaskAttemptRequest = {
    readonly courseId: string
    readonly taskId: string
}

/** GraphQL envelope containing the asynchronous grading job id. */
export type SubmitPersonalTaskAttemptResponse = {
    readonly reviewPersonalProjectTask: GraphQLResponse<{ readonly jobId: string }>
}

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

/** Full authored task document returned by the enrolled task-detail query. */
export type PersonalProjectTaskDetail = PersonalProjectTask & {
    readonly displayId: string
    readonly description: string
    readonly hint: string
    readonly difficulty?: string | null
    readonly verified?: string | null
    readonly criterias: ReadonlyArray<{
        readonly id: string
        readonly text: string
        readonly hint: string
        readonly orderIndex: number
        readonly score: number
    }>
    readonly briefs: ReadonlyArray<{
        readonly id: string
        readonly lang: string
        readonly body: string
        readonly orderIndex: number
    }>
    readonly codeImplementations: ReadonlyArray<{
        readonly id: string
        readonly lang: string
        readonly guide: string
        readonly example: string
        readonly orderIndex: number
    }>
}

/** Enrollment-owned repository settings exposed without returning its secret token. */
export type PersonalProjectRepositorySettings = {
    readonly githubUrl?: string | null
    readonly branch?: string | null
    readonly tokenLast4?: string | null
}

/** One selectable grading model from the public model catalog. */
export type PersonalProjectGradingModel = {
    readonly model: string
    readonly provider: string
    readonly category: string
    readonly complimentary: boolean
    readonly available: boolean
    readonly supportedTasks: ReadonlyArray<string>
}

/** Settled data needed by the task brief and its persistent submission panel. */
export type PersonalProjectTaskWorkspace = {
    readonly task: PersonalProjectTaskDetail
    readonly repository: PersonalProjectRepositorySettings
    readonly models: ReadonlyArray<PersonalProjectGradingModel>
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

/** Count and newest-first rows returned by one attempt-history page. */
export type PersonalTaskAttemptsPage = {
    readonly count: number
    readonly data: ReadonlyArray<PersonalTaskAttempt>
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
    readonly taskId?: string
    readonly githubUrl?: string | null
    readonly branch?: string | null
    readonly selectedModel?: string
    readonly selectedModelProvider?: string
    readonly lang?: string
}

/** GraphQL envelope containing the asynchronous grading job id. */
export type SubmitPersonalTaskAttemptResponse = {
    readonly reviewPersonalProjectTask: GraphQLResponse<{ readonly jobId: string }>
}

/** Partial repository-settings patch; the token remains write-only. */
export type SyncPersonalProjectGithubRequest = {
    readonly courseId: string
    readonly githubUrl?: string | null
    readonly branch?: string | null
    readonly githubToken?: string | null
    readonly clearGithubToken?: boolean | null
}

/** GraphQL acknowledgement for a repository-settings patch. */
export type SyncPersonalProjectGithubResponse = {
    readonly syncPersonalProjectGithub: GraphQLResponse<boolean>
}

/** GraphQL task-detail envelope. */
export type QueryPersonalProjectTaskResponse = {
    readonly task: GraphQLResponse<PersonalProjectTaskDetail>
}

/** GraphQL enrollment-settings envelope. */
export type QueryPersonalProjectRepositoryResponse = {
    readonly courseEnrollmentStatus: GraphQLResponse<{
        readonly isEnrolled: boolean
        readonly enrollment?: {
            readonly personalProjectGithubUrl?: string | null
            readonly personalProjectGithubBranch?: string | null
            readonly personalProjectGithubTokenLast4?: string | null
        } | null
    }>
}

/** GraphQL grading-model catalog envelope. */
export type QueryPersonalProjectGradingModelsResponse = {
    readonly aiModels: GraphQLResponse<{
        readonly gradableModels: ReadonlyArray<PersonalProjectGradingModel>
    }>
}

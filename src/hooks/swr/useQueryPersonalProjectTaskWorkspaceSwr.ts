import useSWR from "swr"
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import {
    queryPersonalProjectGradingModels,
    queryPersonalProjectRepository,
    queryPersonalProjectTask,
} from "@/modules/api/graphql/queries/query-course-personal-project"
import type { PersonalProjectTaskWorkspace } from "@/modules/api/graphql/queries/types/course-personal-project"

/** A task remains usable when repository settings or grading-model discovery is temporarily unavailable. */
export type PersonalProjectTaskWorkspaceResult = PersonalProjectTaskWorkspace & {
    readonly ancillaryUnavailable: boolean
}

/** Stable cache identity for one viewer's composed task workspace. */
export const QUERY_PERSONAL_PROJECT_TASK_WORKSPACE_SWR_KEY =
    "QUERY_PERSONAL_PROJECT_TASK_WORKSPACE_SWR"

const isEnrollmentCode = (errors?: ReadonlyArray<{ readonly extensions?: Readonly<Record<string, unknown>> }>) =>
    errors?.some((item) => item.extensions?.code === "ENROLLMENT_NOT_FOUND_EXCEPTION") === true

const ENROLLMENT_DENIED_CODE = "PERSONAL_PROJECT_ENROLLMENT_DENIED"

class PersonalProjectEnrollmentDeniedError extends Error {
    readonly code = ENROLLMENT_DENIED_CODE
}

/** Distinguishes the guard's GraphQL body from retryable transport and authored-task failures. */
export const isPersonalProjectEnrollmentDenied = (error: unknown) => {
    if (typeof error === "object" && error !== null && "code" in error && error.code === ENROLLMENT_DENIED_CODE) return true
    if (CombinedGraphQLErrors.is(error)) return isEnrollmentCode(error.errors)
    const bodyText = ServerError.is(error)
        ? error.bodyText
        : typeof error === "object" && error !== null && "bodyText" in error && typeof error.bodyText === "string"
            ? error.bodyText
            : undefined
    if (bodyText === undefined) return false
    try {
        const body = JSON.parse(bodyText) as {
            readonly errors?: ReadonlyArray<{ readonly extensions?: Readonly<Record<string, unknown>> }>
        }
        return isEnrollmentCode(body.errors)
    } catch {
        return false
    }
}

/** Settles authored task, repository settings and grading choices as one task-side decision. */
export const useQueryPersonalProjectTaskWorkspaceSwr = (courseId?: string, taskId?: string) => {
    const viewer = useViewerKey()
    return useSWR<PersonalProjectTaskWorkspaceResult>(
        courseId === undefined || taskId === undefined || viewer === undefined
            ? null
            : [QUERY_PERSONAL_PROJECT_TASK_WORKSPACE_SWR_KEY, viewer, courseId, taskId],
        async () => {
            const [taskResult, repositoryResult, modelResult] = await Promise.allSettled([
                queryPersonalProjectTask(taskId ?? "", courseId ?? ""),
                queryPersonalProjectRepository(courseId ?? ""),
                queryPersonalProjectGradingModels(),
            ])
            const enrollmentStatus = repositoryResult.status === "fulfilled"
                ? repositoryResult.value.data?.courseEnrollmentStatus?.data
                : undefined
            if (enrollmentStatus?.isEnrolled === false) throw new PersonalProjectEnrollmentDeniedError("Course enrollment is required.")
            if (taskResult.status === "rejected") throw taskResult.reason
            const task = taskResult.value.data?.task?.data
            if (task === undefined || task === null) throw new Error("Personal-project task is absent.")
            const enrollment = enrollmentStatus?.enrollment
            return {
                task,
                repository: {
                    githubUrl: enrollment?.personalProjectGithubUrl,
                    branch: enrollment?.personalProjectGithubBranch,
                    tokenLast4: enrollment?.personalProjectGithubTokenLast4,
                },
                models: (modelResult.status === "fulfilled" ? modelResult.value.data?.aiModels?.data?.gradableModels ?? [] : [])
                    .filter((model) => model.supportedTasks.includes("grading")),
                ancillaryUnavailable: repositoryResult.status === "rejected" || modelResult.status === "rejected",
            }
        },
    )
}

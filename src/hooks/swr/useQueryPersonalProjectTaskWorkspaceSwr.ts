import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import {
    queryPersonalProjectGradingModels,
    queryPersonalProjectRepository,
    queryPersonalProjectTask,
} from "@/modules/api/graphql/queries/query-course-personal-project"
import type { PersonalProjectTaskWorkspace } from "@/modules/api/graphql/queries/types/course-personal-project"

/** Stable cache identity for one viewer's composed task workspace. */
export const QUERY_PERSONAL_PROJECT_TASK_WORKSPACE_SWR_KEY =
    "QUERY_PERSONAL_PROJECT_TASK_WORKSPACE_SWR"

/** Settles authored task, repository settings and grading choices as one task-side decision. */
export const useQueryPersonalProjectTaskWorkspaceSwr = (courseId?: string, taskId?: string) => {
    const viewer = useViewerKey()
    return useSWR<PersonalProjectTaskWorkspace>(
        courseId === undefined || taskId === undefined || viewer === undefined
            ? null
            : [QUERY_PERSONAL_PROJECT_TASK_WORKSPACE_SWR_KEY, viewer, courseId, taskId],
        async () => {
            const [taskResult, repositoryResult, modelResult] = await Promise.all([
                queryPersonalProjectTask(taskId ?? "", courseId ?? ""),
                queryPersonalProjectRepository(courseId ?? ""),
                queryPersonalProjectGradingModels(),
            ])
            const task = taskResult.data?.task?.data
            if (task === undefined || task === null) throw new Error("Personal-project task is absent.")
            const enrollment = repositoryResult.data?.courseEnrollmentStatus?.data?.enrollment
            return {
                task,
                repository: {
                    githubUrl: enrollment?.personalProjectGithubUrl,
                    branch: enrollment?.personalProjectGithubBranch,
                    tokenLast4: enrollment?.personalProjectGithubTokenLast4,
                },
                models: (modelResult.data?.aiModels?.data?.gradableModels ?? [])
                    .filter((model) => model.supportedTasks.includes("grading")),
            }
        },
    )
}

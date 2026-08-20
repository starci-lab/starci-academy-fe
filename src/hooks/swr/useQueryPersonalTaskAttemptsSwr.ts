import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { queryPersonalTaskAttempts } from "@/modules/api/graphql/queries/query-course-personal-project"
import type { PersonalTaskAttemptsPage } from "@/modules/api/graphql/queries/types/course-personal-project"

/** Stable cache prefix for one viewer's attempt history on a personal-project task. */
export const QUERY_PERSONAL_TASK_ATTEMPTS_SWR_KEY = "QUERY_PERSONAL_TASK_ATTEMPTS_SWR"

/** Reads newest-first graded attempts for one course and personal-project task. */
export const useQueryPersonalTaskAttemptsSwr = (courseId?: string, taskId?: string, pageNumber = 0) => {
    const viewer = useViewerKey()
    return useSWR<PersonalTaskAttemptsPage>(
        courseId === undefined || taskId === undefined || viewer === undefined
            ? null
            : [QUERY_PERSONAL_TASK_ATTEMPTS_SWR_KEY, viewer, courseId, taskId, pageNumber],
        async () => {
            const result = await queryPersonalTaskAttempts({
                courseId: courseId ?? "",
                taskId: taskId ?? "",
                filters: {
                    pageNumber,
                    limit: 20,
                    sorts: [{ by: "attemptNumber", order: "DESC" }],
                },
            })
            return result.data?.userPersonalTaskAttempts?.data ?? { count: 0, data: [] }
        },
    )
}

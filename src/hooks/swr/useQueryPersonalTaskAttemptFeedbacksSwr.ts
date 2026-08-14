import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { queryPersonalTaskAttemptFeedbacks } from "@/modules/api/graphql/queries/query-course-personal-project"
import type { PersonalTaskAttemptFeedback } from "@/modules/api/graphql/queries/types/course-personal-project"

/** Stable cache prefix for one viewer's feedback rows on a graded attempt. */
export const QUERY_PERSONAL_TASK_ATTEMPT_FEEDBACKS_SWR_KEY =
    "QUERY_PERSONAL_TASK_ATTEMPT_FEEDBACKS_SWR"

/** Reads authored-order feedback for one personal-project attempt. */
export const useQueryPersonalTaskAttemptFeedbacksSwr = (attemptId?: string) => {
    const viewer = useViewerKey()
    return useSWR<ReadonlyArray<PersonalTaskAttemptFeedback>>(
        attemptId === undefined || viewer === undefined
            ? null
            : [QUERY_PERSONAL_TASK_ATTEMPT_FEEDBACKS_SWR_KEY, viewer, attemptId],
        async () => {
            const result = await queryPersonalTaskAttemptFeedbacks({
                attemptId: attemptId ?? "",
                filters: {
                    pageNumber: 0,
                    limit: 100,
                    sorts: [{ by: "sortIndex", order: "ASC" }],
                },
            })
            return result.data?.userPersonalTaskAttemptFeedbacks?.data?.data ?? []
        },
    )
}

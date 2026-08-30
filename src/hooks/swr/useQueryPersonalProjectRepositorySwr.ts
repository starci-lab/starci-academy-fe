import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { queryPersonalProjectRepository } from "@/modules/api/graphql/queries/query-course-personal-project"
import type { PersonalProjectRepositorySettings } from "@/modules/api/graphql/queries/types/course-personal-project"

/** Stable cache identity for one viewer's enrollment-owned repository settings. */
export const QUERY_PERSONAL_PROJECT_REPOSITORY_SWR_KEY = "QUERY_PERSONAL_PROJECT_REPOSITORY_SWR"

/** Read repository connection evidence independently from the project roadmap. */
export const useQueryPersonalProjectRepositorySwr = (courseId?: string) => {
    const viewer = useViewerKey()
    return useSWR<PersonalProjectRepositorySettings | null>(
        courseId === undefined || viewer === undefined ? null : [QUERY_PERSONAL_PROJECT_REPOSITORY_SWR_KEY, viewer, courseId],
        async () => {
            const result = await queryPersonalProjectRepository(courseId ?? "")
            const status = result.data?.courseEnrollmentStatus?.data
            if (status?.isEnrolled !== true) return null
            const enrollment = status.enrollment
            return {
                githubUrl: enrollment?.personalProjectGithubUrl,
                branch: enrollment?.personalProjectGithubBranch,
                tokenLast4: enrollment?.personalProjectGithubTokenLast4,
            }
        },
    )
}

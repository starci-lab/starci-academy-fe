import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyLearnedLessons } from "../../modules/api/graphql/queries/query-my-learned-lessons"
import { type MyResumeRefRow } from "../../modules/api/graphql/queries/types/my-resume"

/**
 * The cache key for the lessons the asking learner has been reading.
 *
 * Exported because reading a lesson changes this list, so whatever records that progress can
 * revalidate the list it just invalidated rather than leaving the dashboard offering a lesson the
 * reader has already finished.
 */
export const QUERY_MY_LEARNED_LESSONS_SWR_KEY = ["QUERY_MY_LEARNED_LESSONS_SWR"]

/**
 * Reads the lessons the asking learner recently read.
 *
 * The envelope is unwrapped here, once, so no component reaches through
 * `data.myLearnedLessons.data`. An absent payload becomes an EMPTY ARRAY rather than `null`,
 * because the caller merges this list with another one and a merge is the wrong place to be
 * asking whether a list exists.
 */
export const useQueryMyLearnedLessonsSwr = () => {
    const viewer = useViewerKey()
    return useSWR<Array<MyResumeRefRow>>(
        viewer === undefined ? null : [...QUERY_MY_LEARNED_LESSONS_SWR_KEY, viewer],
        async () => {
            const result = await queryMyLearnedLessons()
            return result.data?.myLearnedLessons?.data ?? []
        },
    )
}

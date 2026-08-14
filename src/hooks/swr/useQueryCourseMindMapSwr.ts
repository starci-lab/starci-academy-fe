import useSWR from "swr"
import { queryCourseMindMap, type CourseMindMap } from "@/modules/api/graphql/queries/query-course-mind-map"
/** Stable SWR key for one course concept graph. */
export const QUERY_COURSE_MIND_MAP_SWR_KEY = "QUERY_COURSE_MIND_MAP_SWR"
/** Read the backend-computed concept graph for a course id or display id. */
export const useQueryCourseMindMapSwr = (courseId?: string) => useSWR<CourseMindMap | null>(courseId === undefined ? null : [QUERY_COURSE_MIND_MAP_SWR_KEY, courseId], async () => (await queryCourseMindMap({ request: { courseId: courseId! } })).data?.courseMindMap.data ?? null)

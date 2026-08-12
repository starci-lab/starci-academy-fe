import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryRecommendedCourses } from "../../modules/api/graphql/queries/query-recommended-courses"
import type { RecommendedCourse } from "../../modules/api/graphql/queries/types/dashboard-learning-community"
/** Stable viewer-scoped recommendation key. */
export const QUERY_RECOMMENDED_COURSES_SWR_KEY = ["QUERY_RECOMMENDED_COURSES_SWR"]
/** Read and unwrap auth-scoped recommendations. */
export const useQueryRecommendedCoursesSwr = () => { const viewer = useViewerKey(); return useSWR<Array<RecommendedCourse> | null>(viewer === undefined ? null : [...QUERY_RECOMMENDED_COURSES_SWR_KEY, viewer], async () => (await queryRecommendedCourses()).data?.recommendedCourses?.data?.items ?? null) }

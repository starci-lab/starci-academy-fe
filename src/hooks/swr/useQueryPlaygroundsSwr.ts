import useSWR from "swr"
import { queryPlaygrounds, type PlaygroundSummary } from "@/modules/api/graphql/queries/query-playgrounds"
/** Stable SWR key for one course's playground catalog. */
export const QUERY_PLAYGROUNDS_SWR_KEY = "QUERY_PLAYGROUNDS_SWR"
/** Read the live playground summaries owned by a course primary key. */
export const useQueryPlaygroundsSwr = (courseId?: string) => useSWR<ReadonlyArray<PlaygroundSummary> | null>(courseId === undefined ? null : [QUERY_PLAYGROUNDS_SWR_KEY, courseId], async () => (await queryPlaygrounds({ courseId: courseId! })).data?.playgrounds.data ?? null)

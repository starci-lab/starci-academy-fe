import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyKpis } from "../../modules/api/graphql/queries/query-my-kpis"
import { type MyKpisData } from "../../modules/api/graphql/queries/types/my-kpis"

/**
 * The cache key for the asking learner's weekly targets.
 *
 * Exported so that whatever SETS a target, or collects for meeting one, can revalidate the figures
 * it just changed - a week still showing the old target after the reader has raised it reads as a
 * form that did nothing.
 */
export const QUERY_MY_KPIS_SWR_KEY = ["QUERY_MY_KPIS_SWR"]

/**
 * Reads the asking learner's weekly targets.
 *
 * The envelope is unwrapped here, once, so no component reaches through `data.myKpis.data`. A
 * missing payload becomes `null` rather than `undefined`, so a component can still tell "you have
 * no week yet" from "the week is on its way".
 */
export const useQueryMyKpisSwr = () => {
    const viewer = useViewerKey()
    return useSWR<MyKpisData | null>(
        viewer === undefined ? null : [...QUERY_MY_KPIS_SWR_KEY, viewer],
        async () => {
            const result = await queryMyKpis()
            return result.data?.myKpis?.data ?? null
        },
    )
}

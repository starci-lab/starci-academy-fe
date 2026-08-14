import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { queryModule, type ModuleDetail } from "@/modules/api/graphql/queries/query-module"

/** The key prefix, so anything that changes a module can revalidate every read of one. */
export const QUERY_MODULE_SWR_KEY = "QUERY_MODULE_SWR"

/** What a caller must say about the module it wants. */
export interface UseQueryModuleSwrParams {
    /** The module's primary id - the segment the reader's route carries. */
    id?: string
}

/**
 * Reads one module and the contents inside it.
 *
 * THE VIEWER IS IN THE KEY for the same reason the content read has it: the server answers this
 * one for a logged-in reader, and a map cached across sign-ins would show one learner the module as
 * another learner was entitled to see it.
 *
 * ITS ANSWER OUTLIVES A PAGE TURN, which is the whole reason it is a separate read: moving to the
 * next content replaces what is being read while leaving the map exactly true, so the rail does not
 * blink each time the reader moves inside it.
 */
export const useQueryModuleSwr = ({ id }: UseQueryModuleSwrParams = {}) => {
    const viewer = useViewerKey()
    return useSWR<ModuleDetail | null>(
        id === undefined || viewer === undefined ? null : [QUERY_MODULE_SWR_KEY, id, viewer],
        async () => {
            const result = await queryModule({ request: { id } })
            return result.data?.module?.data ?? null
        },
    )
}

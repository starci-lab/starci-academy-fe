import useSWRMutation from "swr/mutation"
import { mutationSetContentAiSessionArchived } from "../../modules/api/graphql/mutations/mutation-set-content-ai-session-archived"
import type { SetContentAiSessionArchivedRequest } from "../../modules/api/graphql/mutations/types/set-content-ai-session-archived"

type Trigger = { readonly arg: SetContentAiSessionArchivedRequest }

/** Stable mutation identity for reversible archive changes. */
export const MUTATE_SET_CONTENT_AI_SESSION_ARCHIVED_SWR_KEY = "MUTATE_SET_CONTENT_AI_SESSION_ARCHIVED_SWR"

/** Archives or restores a conversation without deleting its turns. */
export const useMutateSetContentAiSessionArchivedSwr = () => useSWRMutation(
    MUTATE_SET_CONTENT_AI_SESSION_ARCHIVED_SWR_KEY,
    async (_key: string, { arg }: Trigger) => {
        const result = await mutationSetContentAiSessionArchived({ request: arg })
        const response = result.data?.setContentAiSessionArchived
        if (response?.success !== true || response.data === undefined) {
            throw new Error(response?.message ?? "Content-AI archive state could not be changed.")
        }
        return response.data
    },
)

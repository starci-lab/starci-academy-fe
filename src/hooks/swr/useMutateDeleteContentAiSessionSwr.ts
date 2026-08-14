import useSWRMutation from "swr/mutation"
import { mutationDeleteContentAiSession } from "../../modules/api/graphql/mutations/mutation-delete-content-ai-session"
import type { DeleteContentAiSessionRequest } from "../../modules/api/graphql/mutations/types/delete-content-ai-session"

type Trigger = { readonly arg: DeleteContentAiSessionRequest }

/** Stable mutation identity for permanent conversation deletion. */
export const MUTATE_DELETE_CONTENT_AI_SESSION_SWR_KEY = "MUTATE_DELETE_CONTENT_AI_SESSION_SWR"

/** Permanently deletes one owned conversation after UI confirmation. */
export const useMutateDeleteContentAiSessionSwr = () => useSWRMutation(
    MUTATE_DELETE_CONTENT_AI_SESSION_SWR_KEY,
    async (_key: string, { arg }: Trigger) => {
        const result = await mutationDeleteContentAiSession({ request: arg })
        const response = result.data?.deleteContentAiSession
        if (response?.success !== true || response.data === undefined) {
            throw new Error(response?.message ?? "Content-AI conversation could not be deleted.")
        }
        return response.data
    },
)

import useSWRMutation from "swr/mutation"
import { mutationCreateContentAiSession } from "../../modules/api/graphql/mutations/mutation-create-content-ai-session"
import type { CreateContentAiSessionRequest } from "../../modules/api/graphql/mutations/types/create-content-ai-session"

type Trigger = { readonly arg: CreateContentAiSessionRequest }

/** Stable mutation identity for lazy conversation creation. */
export const MUTATE_CREATE_CONTENT_AI_SESSION_SWR_KEY = "MUTATE_CREATE_CONTENT_AI_SESSION_SWR"

/** Lazily creates a conversation and preserves a successful null id as business data. */
export const useMutateCreateContentAiSessionSwr = () => useSWRMutation(
    MUTATE_CREATE_CONTENT_AI_SESSION_SWR_KEY,
    async (_key: string, { arg }: Trigger) => {
        const result = await mutationCreateContentAiSession({ request: arg })
        const response = result.data?.createContentAiSession
        if (response?.success !== true || response.data === undefined) {
            throw new Error(response?.message ?? "Content-AI conversation could not be created.")
        }
        return response.data
    },
)

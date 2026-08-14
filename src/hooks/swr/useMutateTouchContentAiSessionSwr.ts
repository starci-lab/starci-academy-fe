import useSWRMutation from "swr/mutation"
import { mutationTouchContentAiSession } from "../../modules/api/graphql/mutations/mutation-touch-content-ai-session"
import type { TouchContentAiSessionRequest } from "../../modules/api/graphql/mutations/types/touch-content-ai-session"

type Trigger = { readonly arg: TouchContentAiSessionRequest }

/** Stable mutation identity for conversation recency updates. */
export const MUTATE_TOUCH_CONTENT_AI_SESSION_SWR_KEY = "MUTATE_TOUCH_CONTENT_AI_SESSION_SWR"

/** Marks a selected conversation as most recently opened. */
export const useMutateTouchContentAiSessionSwr = () => useSWRMutation(
    MUTATE_TOUCH_CONTENT_AI_SESSION_SWR_KEY,
    async (_key: string, { arg }: Trigger) => {
        const result = await mutationTouchContentAiSession({ request: arg })
        const response = result.data?.touchContentAiSession
        if (response?.success !== true || response.data === undefined) {
            throw new Error(response?.message ?? "Content-AI conversation recency could not be updated.")
        }
        return response.data
    },
)

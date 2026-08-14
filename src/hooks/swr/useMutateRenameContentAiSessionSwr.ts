import useSWRMutation from "swr/mutation"
import { mutationRenameContentAiSession } from "../../modules/api/graphql/mutations/mutation-rename-content-ai-session"
import type { RenameContentAiSessionRequest } from "../../modules/api/graphql/mutations/types/rename-content-ai-session"

type Trigger = { readonly arg: RenameContentAiSessionRequest }

/** Stable mutation identity for conversation title changes. */
export const MUTATE_RENAME_CONTENT_AI_SESSION_SWR_KEY = "MUTATE_RENAME_CONTENT_AI_SESSION_SWR"

/** Renames or resets one saved conversation title. */
export const useMutateRenameContentAiSessionSwr = () => useSWRMutation(
    MUTATE_RENAME_CONTENT_AI_SESSION_SWR_KEY,
    async (_key: string, { arg }: Trigger) => {
        const result = await mutationRenameContentAiSession({ request: arg })
        const response = result.data?.renameContentAiSession
        if (response?.success !== true || response.data === undefined) {
            throw new Error(response?.message ?? "Content-AI conversation could not be renamed.")
        }
        return response.data
    },
)

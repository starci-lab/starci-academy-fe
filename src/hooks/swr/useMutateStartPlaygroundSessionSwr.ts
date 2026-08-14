import useSWRMutation from "swr/mutation"
import {
    mutationStartPlaygroundSession,
    type StartPlaygroundSessionRequest,
} from "@/modules/api/graphql/mutations/mutation-start-playground-session"

/** Stable SWR key for creating authenticated playground sessions. */
export const MUTATE_START_PLAYGROUND_SESSION_SWR_KEY = "MUTATE_START_PLAYGROUND_SESSION_SWR"
/** Trigger argument accepted by the playground-session mutation hook. */
export type StartPlaygroundSessionTrigger = { readonly arg: StartPlaygroundSessionRequest }

/** Trigger a server-owned playground session without creating a second local session model. */
export const useMutateStartPlaygroundSessionSwr = (playgroundId?: string) => useSWRMutation(
    playgroundId === undefined ? null : [MUTATE_START_PLAYGROUND_SESSION_SWR_KEY, playgroundId] as const,
    async (_key, { arg }: StartPlaygroundSessionTrigger) => mutationStartPlaygroundSession({ request: arg }),
)

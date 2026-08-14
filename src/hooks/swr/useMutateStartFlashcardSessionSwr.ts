import useSWRMutation from "swr/mutation"
import {
    mutationStartFlashcardSession,
    type StartFlashcardSessionRequest,
} from "@/modules/api/graphql/mutations/mutation-start-flashcard-session"

interface StartFlashcardSessionMutationArg { readonly arg: StartFlashcardSessionRequest }

/** Stable mutation family for every persisted flashcard session start. */
export const MUTATE_START_FLASHCARD_SESSION_SWR_KEY = "MUTATE_START_FLASHCARD_SESSION_SWR"

/** Starts a backend-persisted deck, due-review, or quiz session. */
export const useMutateStartFlashcardSessionSwr = () => useSWRMutation(
    MUTATE_START_FLASHCARD_SESSION_SWR_KEY,
    async (_key, { arg }: StartFlashcardSessionMutationArg) => mutationStartFlashcardSession(arg),
)

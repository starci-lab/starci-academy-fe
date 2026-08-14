import useSWRMutation from "swr/mutation"
import {
    mutationCompleteFlashcardSession,
    type CompleteFlashcardSessionRequest,
} from "@/modules/api/graphql/mutations/mutation-complete-flashcard-session"

interface CompleteFlashcardSessionMutationArg { readonly arg: CompleteFlashcardSessionRequest }

/** Stable mutation family for persisted flashcard session completion. */
export const MUTATE_COMPLETE_FLASHCARD_SESSION_SWR_KEY = "MUTATE_COMPLETE_FLASHCARD_SESSION_SWR"

/** Completes one deck, due-review, or quiz session without changing its route identity. */
export const useMutateCompleteFlashcardSessionSwr = () => useSWRMutation(
    MUTATE_COMPLETE_FLASHCARD_SESSION_SWR_KEY,
    async (_key, { arg }: CompleteFlashcardSessionMutationArg) => mutationCompleteFlashcardSession(arg),
)

import useSWRMutation from "swr/mutation"
import {
    mutationRateFlashcard,
    mutationSyncFlashcardSession,
    type RateFlashcardRequest,
    type SyncFlashcardSessionRequest,
} from "@/modules/api/graphql/mutations/mutation-sync-flashcard-session"

interface SyncFlashcardSessionMutationArg { readonly arg: SyncFlashcardSessionRequest }
interface RateFlashcardMutationArg { readonly arg: RateFlashcardRequest }

/** Stable mutation family for resumable flashcard progress snapshots. */
export const MUTATE_SYNC_FLASHCARD_SESSION_SWR_KEY = "MUTATE_SYNC_FLASHCARD_SESSION_SWR"
/** Stable mutation family for one SM-2 card grade. */
export const MUTATE_RATE_FLASHCARD_SWR_KEY = "MUTATE_RATE_FLASHCARD_SWR"

/** Syncs one live session to the backend family selected by its discriminator. */
export const useMutateSyncFlashcardSessionSwr = () => useSWRMutation(
    MUTATE_SYNC_FLASHCARD_SESSION_SWR_KEY,
    async (_key, { arg }: SyncFlashcardSessionMutationArg) => mutationSyncFlashcardSession(arg),
)

/** Grades one review card through the backend SM-2 operation. */
export const useMutateRateFlashcardSwr = () => useSWRMutation(
    MUTATE_RATE_FLASHCARD_SWR_KEY,
    async (_key, { arg }: RateFlashcardMutationArg) => mutationRateFlashcard(arg),
)

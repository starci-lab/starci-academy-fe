import useSWRMutation from "swr/mutation"
import { mutationSetFollow } from "../../modules/api/graphql/mutations/mutation-set-follow"
import type { SetFollowRequest } from "../../modules/api/graphql/mutations/types/set-follow"

type SetFollowTrigger = { readonly arg: SetFollowRequest }

/** Stable mutation key for follow-state changes. */
export const MUTATE_SET_FOLLOW_SWR_KEY = "MUTATE_SET_FOLLOW_SWR"

/** Sets the authenticated viewer's follow state for one user. */
export const useMutateSetFollowSwr = () => useSWRMutation(
    MUTATE_SET_FOLLOW_SWR_KEY,
    async (_key: string, { arg }: SetFollowTrigger) => mutationSetFollow({ request: arg }),
)


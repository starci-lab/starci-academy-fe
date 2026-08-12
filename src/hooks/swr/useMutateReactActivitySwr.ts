import useSWRMutation from "swr/mutation"
import { mutationReactActivity } from "../../modules/api/graphql/mutations/mutation-react-activity"
import type { ReactActivityRequest } from "../../modules/api/graphql/mutations/types/react-activity"

type ReactActivityTrigger = { readonly arg: ReactActivityRequest }

/** Stable mutation key for feed reactions. */
export const MUTATE_REACT_ACTIVITY_SWR_KEY = "MUTATE_REACT_ACTIVITY_SWR"

/** Sets, changes, or removes the viewer's reaction on one feed activity. */
export const useMutateReactActivitySwr = () => useSWRMutation(
    MUTATE_REACT_ACTIVITY_SWR_KEY,
    async (_key: string, { arg }: ReactActivityTrigger) => mutationReactActivity({ request: arg }),
)


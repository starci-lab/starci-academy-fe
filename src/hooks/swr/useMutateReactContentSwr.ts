import useSWRMutation from "swr/mutation"
import { mutationReactContent, type ReactContentRequest } from "@/modules/api/graphql/mutations/mutation-react-content"

type Trigger = { readonly arg: ReactContentRequest }

/** Stable SWR mutation identity for lesson reaction writes. */
export const MUTATE_REACT_CONTENT_SWR_KEY = "MUTATE_REACT_CONTENT_SWR"

/** Sets or clears the viewer's lesson reaction. */
export const useMutateReactContentSwr = () => useSWRMutation(
    MUTATE_REACT_CONTENT_SWR_KEY,
    async (_key: string, { arg }: Trigger) => mutationReactContent({ request: arg }),
)

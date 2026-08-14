import useSWRMutation from "swr/mutation"
import { mutationSubmitContentComment, type SubmitContentCommentRequest } from "@/modules/api/graphql/mutations/mutation-submit-content-comment"

type Trigger = { readonly arg: SubmitContentCommentRequest }

/** Stable SWR mutation identity for lesson discussion submissions. */
export const MUTATE_SUBMIT_CONTENT_COMMENT_SWR_KEY = "MUTATE_SUBMIT_CONTENT_COMMENT_SWR"

/** Creates a lesson comment or reply. */
export const useMutateSubmitContentCommentSwr = () => useSWRMutation(
    MUTATE_SUBMIT_CONTENT_COMMENT_SWR_KEY,
    async (_key: string, { arg }: Trigger) => mutationSubmitContentComment({ request: arg }),
)

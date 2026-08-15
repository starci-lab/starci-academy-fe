import useSWRMutation from "swr/mutation"
import { mutationSignOut } from "@/modules/api/graphql/mutations/mutation-sign-out"

/** Stable cache identity for the browser sign-out mutation. */
export const MUTATE_SIGN_OUT_SWR_KEY = "MUTATE_SIGN_OUT_SWR"

/** Sign out this browser; local session state is cleared by the account owner after success. */
export const useMutateSignOutSwr = () => useSWRMutation(
    MUTATE_SIGN_OUT_SWR_KEY,
    async () => {
        const result = await mutationSignOut()
        const response = result.data?.signOut
        if (response?.success !== true) throw new Error(response?.message ?? "Sign out failed.")
        return response
    },
)

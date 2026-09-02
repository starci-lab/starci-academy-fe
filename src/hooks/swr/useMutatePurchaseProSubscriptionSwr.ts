import useSWRMutation from "swr/mutation"
import { mutationPurchaseProSubscription } from "../../modules/api/graphql/mutations/mutation-purchase-pro-subscription"
import { type MutationPurchaseProSubscriptionRequest } from "../../modules/api/graphql/mutations/types/pro-subscription"

/** Stable write boundary for opening one Pro checkout. */
export const MUTATE_PURCHASE_PRO_SUBSCRIPTION_SWR_KEY = "MUTATE_PURCHASE_PRO_SUBSCRIPTION_SWR"

/** Purchase request handed from SWR mutation trigger to the transport helper. */
export type PurchaseProSubscriptionTrigger = {
    readonly arg: MutationPurchaseProSubscriptionRequest
}

/** One mutation key prevents a second checkout while the first handoff is opening. */
export const useMutatePurchaseProSubscriptionSwr = () => useSWRMutation(
    MUTATE_PURCHASE_PRO_SUBSCRIPTION_SWR_KEY,
    async (_key: string, { arg }: PurchaseProSubscriptionTrigger) => mutationPurchaseProSubscription(arg),
)

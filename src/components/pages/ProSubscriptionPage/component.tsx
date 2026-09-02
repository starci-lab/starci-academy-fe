import { ProSubscriptionBlock } from "@/components/blocks/commerce/ProSubscriptionBlock"

/** Pure page composition; the commerce block owns offer and checkout state. */
export type ProSubscriptionPageProps = Record<never, never>

/** Seat the connected Pro commerce block in the route surface. */
export const ProSubscriptionPageBase = (props: ProSubscriptionPageProps) => {
    void props
    return <ProSubscriptionBlock />
}

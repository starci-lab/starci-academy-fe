import { CartBlock } from "@/components/blocks/commerce/CartBlock"

/** Page composition owns no cart request, state, data, or actions. */
export const CartPageBase = () => <CartBlock />

/** Source-level ownership marker for the page composition. */
export const meta = { world: "connected", domain: "commerce" } as const

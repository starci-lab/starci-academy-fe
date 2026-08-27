import { CartBlock } from "@/components/blocks/commerce/CartBlock"

/** Page composition owns no cart request, state, data, or actions. */
/** Props for the route-independent cart page. */
export type CartPageProps = Record<never, never>
/** Render the cart block within the route shell. */
export const CartPageBase = (props: CartPageProps) => { void props; return <CartBlock /> }

import { CartPage } from "@/components/pages/CartPage"

/**
 * `/[lang]/cart` - the basket, with room to read it.
 *
 * Dynamic like every other route here: the cart is the viewer's own and renders nothing without a
 * token, so there is nothing to prerender.
 */
export const dynamic = "force-dynamic"

const Route = () => <CartPage {...{}} />

export default Route

"use client"
import { CartPageBase } from "~candidate/components/pages/CartPage/component"
import { CartDrawerBase } from "~candidate/components/overlays/commerce/CartDrawer/component"
import { CheckoutOverlayBase } from "~candidate/components/overlays/commerce/CheckoutOverlay/component"
import type { RenderedState } from "~candidate/states"

/**
 * Review chrome, not candidate source: nothing here is ported.
 *
 * It is a client boundary for the reason the target has one in the same place - every StarCi leaf
 * reaches HeroUI, which reaches `client-only`. Production crosses that boundary in its routed page;
 * the candidate crosses it here, one step further out, because the enumerating route above must
 * stay a server component to emit one static file per state.
 */

/** Props for {@link RenderState}. */
export interface RenderStateProps {
    /** The state to draw. */
    readonly state: RenderedState
}

/**
 * Draw one state.
 *
 * @param input - {@link RenderStateProps}
 */
export const RenderState = (input: RenderStateProps) => {
    if (input.state.surface === "page") return <CartPageBase {...input.state.page} />
    if (input.state.surface === "drawer") return <CartDrawerBase {...input.state.drawer} />
    return <CheckoutOverlayBase {...input.state.checkout} />
}

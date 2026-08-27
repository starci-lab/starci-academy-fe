"use client"

import { CartPageBase } from "./component"

/** The page owns only the route-level composition; CartBlock owns cart state and actions. */
export type CartPageProps = Record<never, never>
/** Render the connected cart route. */
export const CartPage = (props: CartPageProps) => { void props; return <CartPageBase {...{}} /> }

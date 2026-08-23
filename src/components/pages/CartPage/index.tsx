"use client"

import { CartPageBase } from "./component"

/** The page owns only the route-level composition; CartBlock owns cart state and actions. */
export const CartPage = () => <CartPageBase />

/** Source-level ownership marker for the connected route entry. */
export const meta = { world: "connected", domain: "commerce" } as const

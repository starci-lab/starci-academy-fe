import type { ReactNode } from "react"
import { ShellNav } from "@/components/layouts/ShellNav"

/** Props for the cart route layout. */
type CartLayoutProps = {
    readonly children: ReactNode
}

/**
 * Keep global navigation mounted over the basket.
 *
 * The same reason the catalog carries it: a reader who arrives here can still leave, and an empty
 * basket's way out is the catalogue in the navbar as much as the notice in the page. Without it the
 * route rendered on the bare root layout - correct content, no shell, no way out - which is exactly
 * what the first load of this page showed.
 *
 * It also mounts the drawer, because `ShellNav` owns the control that opens it. A basket page that
 * dropped the chrome would drop the drawer with it, and the same basket would be reachable from
 * every route except its own.
 */
const CartLayout = ({ children }: CartLayoutProps) => (
    <>
        <ShellNav {...{}} />
        <main>{children}</main>
    </>
)

export default CartLayout

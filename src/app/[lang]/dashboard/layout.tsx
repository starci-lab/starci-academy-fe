import type { ReactNode } from "react"
import { ShellNav } from "@/components/product-shells/ShellNav"

/** Props for the dashboard route family layout. */
type DashboardLayoutProps = {
    readonly children: ReactNode
}

/**
 * Keep dashboard navigation beside the routed dashboard body.
 *
 * Authentication deliberately lives outside this nested layout, so its route receives providers
 * from the root but cannot accidentally inherit the product navbar.
 *
 * This layout opens the route's single `main` so assistive technology can skip the navbar above it
 * instead of walking every link again on each route change.
 */
const DashboardLayout = ({ children }: DashboardLayoutProps) => (
    <>
        <ShellNav {...{}} />
        <main className="w-full overflow-x-clip pt-0 pb-16 lg:pb-0 lg:pl-0">{children}</main>
    </>
)

export default DashboardLayout

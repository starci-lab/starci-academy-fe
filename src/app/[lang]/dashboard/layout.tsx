import type { ReactNode } from "react"
import { ShellNav } from "@/components/layouts/ShellNav"

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
        <main className="mx-auto w-full max-w-7xl p-6 pb-28 lg:pb-6">{children}</main>
    </>
)

export default DashboardLayout

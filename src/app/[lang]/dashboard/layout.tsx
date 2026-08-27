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
 * The routed page opens a `main` so the landmark lets assistive technology skip the navbar above it
 * instead of walking every link again on each route change.
 */
const DashboardLayout = ({ children }: DashboardLayoutProps) => (
    <>
        <ShellNav {...{}} />
        <main>{children}</main>
    </>
)

export default DashboardLayout

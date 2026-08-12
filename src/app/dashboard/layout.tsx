import type { ReactNode } from "react"
import { Tree } from "@/components/branches/Tree"
import { ShellNav } from "@/components/layouts/ShellNav"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"

/** Props for the dashboard route family layout. */
type DashboardLayoutProps = {
    readonly children: ReactNode
}

/**
 * Keep dashboard navigation beside the routed dashboard body.
 *
 * Authentication deliberately lives outside this nested layout, so its route receives providers
 * from the root but cannot accidentally inherit the product navbar.
 */
const DashboardLayout = ({ children }: DashboardLayoutProps) => (
    <Tree
        contract="nav-over-body-page"
        render={defineContractComponent("nav-over-body-page", {
            navigation: defineContractProjection("double-navbar", () => <ShellNav />),
            body: defineLeafComponent("page", {}, () => children),
        })}
    />
)

export default DashboardLayout

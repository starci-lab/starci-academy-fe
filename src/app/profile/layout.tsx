import type { ReactNode } from "react"
import { Tree } from "@/components/branches/Tree"
import { ShellNav } from "@/components/layouts/ShellNav"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
type ProfileLayoutProps = { readonly children: ReactNode }
/** Keep global navigation mounted across the profile route cluster. */
const ProfileLayout = ({ children }: ProfileLayoutProps) => (
    <Tree
        contract="nav-over-body-page"
        render={defineContractComponent("nav-over-body-page", {
            navigation: defineContractProjection("double-navbar", () => <ShellNav />),
            body: defineContractProjection("routed-page-main", () => (
                <Tree
                    contract="routed-page-main"
                    render={defineContractComponent("routed-page-main", {
                        page: defineLeafComponent("page", {}, () => children),
                    })}
                />
            )),
        })}
    />
)
export default ProfileLayout

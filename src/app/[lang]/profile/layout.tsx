import type { ReactNode } from "react"
import { ShellNav } from "@/components/product-shells/ShellNav"
type ProfileLayoutProps = { readonly children: ReactNode }
/** Keep global navigation mounted across the profile route cluster. */
const ProfileLayout = ({ children }: ProfileLayoutProps) => (
    <>
        <ShellNav {...{}} />
        <main>{children}</main>
    </>
)
export default ProfileLayout

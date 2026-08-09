import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Tree } from "@/components/frames/Tree"
import "./globals.css"

/**
 * The app shell.
 *
 * The shell is the one place the `page-shell` registry key is used, and it is used
 * for the reason the key states: the navigation is a SIBLING of the routed body, so
 * a route change repaints the body without tearing the nav down. Expressing that as
 * a key rather than as markup here means the relationship is checked by the type
 * system instead of being re-decided by whoever edits this file next.
 */

/** Browser-level metadata for every route under this shell. */
export const metadata: Metadata = {
    title: "StarCi Academy",
    description: "Learner dashboard.",
}

/** Props for the root layout. */
interface RootLayoutProps {
    /** The routed page, mounted into the shell's `body` role. */
    children: ReactNode
}

/** The single link the shell nav carries today - the `action` role of `shell-nav`. */
const DashboardLink = () => <a href="/dashboard">Dashboard</a>

/**
 * Route-level navigation - the `nav` role of the `page-shell` key.
 *
 * The `<nav>` landmark is not written here. `shell-nav` declares it, so the landmark is a fact
 * the registry owns rather than a tag this file picked - the same reason the gap and the child
 * contract are not written here either.
 */
const ShellNav = () => (
    <Tree
        name="shell-nav"
        slots={{
            action: DashboardLink,
        }}
    />
)

/**
 * Root layout: draws the shell tree and mounts the routed page into its `body` role.
 *
 * @param props - The routed children to mount.
 */
const RootLayout = ({ children }: RootLayoutProps) => {
    /** The routed page, wrapped uncalled so the frame can mount it as a slot. */
    const ShellBody = () => <>{children}</>
    return (
        <html lang="en">
            <body>
                <Tree name="page-shell" slots={{ nav: ShellNav, body: ShellBody }} />
            </body>
        </html>
    )
}

export default RootLayout

import type { Metadata } from "next"
import type { ReactNode } from "react"
import { ShellNav } from "@/components/layouts/ShellNav"
import { Tree } from "@/components/frames/Tree"
import { AppProviders } from "./providers"
import "./globals.css"

/**
 * The app shell.
 *
 * The shell is the one place the `page-shell` registry key is used, and it is used
 * for the reason the key states: the navigation is a SIBLING of the routed body, so
 * a route change repaints the body without tearing the nav down. Expressing that as
 * a key rather than as markup here means the relationship is checked by the type
 * system instead of being re-decided by whoever edits this file next.
 *
 * The bar itself is `layouts/ShellNav`, not markup written here: it holds the state that says
 * whether the sign-in overlay is open, and this file is a server component that cannot hold
 * state. The one thing this file adds around the whole tree is the vendor's context.
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
                <AppProviders>
                    <Tree contract="page-shell" slots={{ nav: ShellNav, body: ShellBody }} />
                </AppProviders>
            </body>
        </html>
    )
}

export default RootLayout

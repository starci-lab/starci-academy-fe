import type { Metadata } from "next"
import type { ReactNode } from "react"
import { getLocale, getMessages, getTranslations } from "next-intl/server"
import { ShellNav } from "@/components/layouts/ShellNav"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
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

/**
 * Browser-level metadata for every route under this shell.
 *
 * Resolved rather than declared, because the tab title and the description a search engine reads
 * are copy like any other. A static object here would have been the one English sentence left in
 * the app, and the one nobody would have noticed.
 */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("app")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Props for the root layout. */
interface RootLayoutProps {
    /** The routed page, mounted into the shell's `body` role. */
    children: ReactNode
}

/**
 * Root layout: draws the shell node and puts the bar and the routed page inside it.
 *
 * @param props - The routed children to mount.
 */
const RootLayout = async ({ children }: RootLayoutProps) => {
    const locale = await getLocale()
    const messages = await getMessages()
    return (
        // `suppressHydrationWarning` is required by the theme switch and by nothing else: the
        // provider writes the resolved theme onto this element before React hydrates, so the
        // server's markup and the browser's first paint differ on purpose. Suppressing it here
        // is narrow - it covers this element's own attributes, not the tree below it.
        <html lang={locale} suppressHydrationWarning>
            <body>
                <AppProviders locale={locale} messages={messages}>
                    <Tree
                        contract="nav-over-body-page"
                        render={defineContractComponent("nav-over-body-page", {
                            navigation: defineContractProjection(
                                "double-navbar",
                                () => <ShellNav />,
                            ),
                            body: defineLeafComponent("page", {}, () => children),
                        })}
                    />
                </AppProviders>
            </body>
        </html>
    )
}

export default RootLayout

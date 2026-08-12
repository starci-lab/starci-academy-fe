import type { Metadata } from "next"
import type { ReactNode } from "react"
import { getLocale, getMessages, getTranslations } from "next-intl/server"
import { AppProviders } from "./providers"
import "./globals.css"

/**
 * The app root.
 *
 * Providers belong to every route; product navigation does not. The dashboard layout owns its
 * navbar so `/authentication` remains a single-task screen with no route or account controls
 * competing with the form.
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
 * Root layout: provide shared runtime context and leave route composition to nested layouts.
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
                    {children}
                </AppProviders>
            </body>
        </html>
    )
}

export default RootLayout

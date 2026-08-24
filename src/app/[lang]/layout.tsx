import type { Metadata } from "next"
import { Be_Vietnam_Pro } from "next/font/google"
import { notFound } from "next/navigation"
import { getMessages, getTranslations } from "next-intl/server"
import { hasLocale } from "next-intl"
import { routing } from "@/i18n/routing"
import {
    openGraphLocale,
    readSeoConfig,
} from "@/config/seo"
import { GlobalAiChatLayout } from "@/components/layouts/GlobalAiChatLayout"
import { AppProviders } from "../providers"
import "../globals.css"

/**
 * The locale shell: the one place that knows which language everything below it is in.
 *
 * It replaces a root layout that read the locale from a cookie. The difference is that the answer
 * now comes from the ADDRESS, so two readers on two languages are on two URLs rather than on one
 * URL that renders differently depending on who is asking - which is what made the Vietnamese page
 * impossible to link to or to index.
 */

/**
 * THIS APP IS NOT PRE-RENDERED, AND SAYING SO IS THE POINT.
 *
 * A `generateStaticParams` here looks like free performance and is not: it asks Next to build
 * `/en/dashboard` and `/vi/dashboard` at compile time, and every screen behind this shell is
 * session-gated - each one renders nothing at all until a token exists in the browser. So the
 * prerender produces empty pages, and it fails while producing them, twice over: `useSearchParams`
 * forces a client bailout that a prerendered page must wrap in Suspense, and the route locale now
 * comes from Next's `next/root-params` integration rather than a per-page request-locale override.
 *
 * Both are fixable. Neither is worth fixing to pre-build a blank screen.
 */
export const dynamic = "force-dynamic"

const starCiSans = Be_Vietnam_Pro({
    display: "swap",
    subsets: ["latin", "vietnamese"],
    variable: "--starci-font-sans",
    weight: ["400", "500", "600"],
})

/**
 * Browser-level metadata for every route in this language.
 *
 * Resolved rather than declared, because the tab title and the description a search engine reads
 * are copy like any other. A static object here would have been the one English sentence left in
 * the app, and the one nobody would have noticed.
 */
export const generateMetadata = async ({ params }: LayoutProps<"/[lang]">): Promise<Metadata> => {
    const { lang } = await params
    if (!hasLocale(routing.locales, lang)) notFound()
    const t = await getTranslations("app")
    const config = readSeoConfig()
    const title = t("title")
    const description = t("description")
    return {
        metadataBase: new URL(config.siteUrl),
        applicationName: config.siteName,
        title: {
            default: title,
            template: `%s | ${config.siteName}`,
        },
        description,
        verification: config.googleSiteVerification
            ? { google: config.googleSiteVerification }
            : undefined,
        openGraph: {
            type: "website",
            siteName: config.siteName,
            title,
            description,
            locale: openGraphLocale(lang),
            images: [config.imagePath],
        },
    }
}

/**
 * Mount the shared runtime context for one language and leave composition to nested layouts.
 *
 * The props type is Next's own generated `LayoutProps<"/[lang]">` rather than a hand-written
 * interface: the segment name and the shape of `params` are facts the router already knows, and a
 * second declaration of them is one rename away from disagreeing with the folder it describes.
 *
 * @param props - The routed children and the language segment.
 */
const LocaleLayout = async ({ children, params }: LayoutProps<"/[lang]">) => {
    const { lang } = await params
    // A segment is reader-supplied text. An unknown language is a route that does not exist, not a
    // request to fall back silently - falling back would serve English at a Vietnamese-looking URL
    // and quietly make every such link wrong.
    if (!hasLocale(routing.locales, lang)) notFound()
    const messages = await getMessages()
    return (
        // `suppressHydrationWarning` is required by the theme switch and by nothing else: the
        // provider writes the resolved theme onto this element before React hydrates, so the
        // server's markup and the browser's first paint differ on purpose. Suppressing it here
        // is narrow - it covers this element's own attributes, not the tree below it.
        <html className={starCiSans.variable} data-grammar="core" lang={lang} suppressHydrationWarning>
            <body>
                <AppProviders locale={lang} messages={messages}>
                    <GlobalAiChatLayout surface={children} />
                </AppProviders>
            </body>
        </html>
    )
}

export default LocaleLayout

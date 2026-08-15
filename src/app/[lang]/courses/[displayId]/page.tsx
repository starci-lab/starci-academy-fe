import type {
    Metadata,
} from "next"
import {
    notFound,
} from "next/navigation"
import {
    hasLocale,
} from "next-intl"
import {
    getTranslations,
    setRequestLocale,
} from "next-intl/server"
import { CourseDetailPage } from "@/components/pages/CourseDetailPage"
import {
    routing,
} from "@/i18n/routing"
import {
    localizedAlternates,
    localizedUrl,
    openGraphLocale,
    readSeoConfig,
} from "@/config/seo"

/**
 * The `/courses/[displayId]` route. A mounting point and nothing else, exactly like the catalog
 * beside it: every decision about what the page IS lives one tier down, where it can be rendered,
 * tested and changed without a router.
 *
 * It inherits the courses layout, so the navbar and the `main` landmark are already open around it.
 *
 * IT IS A SERVER COMPONENT ONLY TO READ THE SEGMENT. `params` is a promise in Next 16; awaiting it
 * here keeps the display id out of client-side routing state, and the page below is the client
 * boundary that actually fetches.
 */

/** Props Next hands a dynamic segment. */
interface CourseDetailRouteProps {
    /** The resolved route parameters. */
    params: Promise<{ lang: string, displayId: string }>
}

/** Publish route-identity metadata without duplicating the client course query. */
export const generateMetadata = async ({
    params,
}: CourseDetailRouteProps): Promise<Metadata> => {
    const { lang, displayId } = await params
    if (!hasLocale(routing.locales, lang)) notFound()
    setRequestLocale(lang)
    const t = await getTranslations("courses.catalog")
    const config = readSeoConfig()
    const path = `/courses/${encodeURIComponent(displayId)}`
    const title = `${displayId} — ${t("title")}`
    return {
        title,
        alternates: localizedAlternates(lang, path, config),
        openGraph: {
            title,
            description: config.description,
            url: localizedUrl(lang, path, config),
            locale: openGraphLocale(lang),
        },
    }
}

const CourseDetailRoute = async (input: CourseDetailRouteProps) => {
    const { displayId } = await input.params
    return <CourseDetailPage displayId={displayId} />
}

export default CourseDetailRoute

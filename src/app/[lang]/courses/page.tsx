import type {
    Metadata,
} from "next"
import {
    notFound,
} from "next/navigation"
import {
    getTranslations,
} from "next-intl/server"
import {
    hasLocale,
} from "next-intl"
import { CoursesCatalogPage } from "@/components/pages/CoursesCatalogPage"
import {
    routing,
} from "@/i18n/routing"
import {
    localizedAlternates,
    localizedUrl,
    openGraphLocale,
    readSeoConfig,
} from "@/config/seo"

/** Publish exact canonical and social metadata for the localized public catalog. */
export const generateMetadata = async ({
    params,
}: PageProps<"/[lang]/courses">): Promise<Metadata> => {
    const { lang } = await params
    if (!hasLocale(routing.locales, lang)) notFound()
    const t = await getTranslations("courses.catalog")
    const config = readSeoConfig()
    const title = t("title")
    return {
        title,
        alternates: localizedAlternates(lang, "/courses", config),
        openGraph: {
            title,
            description: config.description,
            url: localizedUrl(lang, "/courses", config),
            locale: openGraphLocale(lang),
        },
    }
}

/**
 * The `/courses` route. It renders the page component and nothing else: the route is a mounting
 * point, so every decision about what the catalog IS lives one tier down where it can be
 * rendered, tested and changed without a router.
 */
const CoursesRoute = () => <CoursesCatalogPage />

export default CoursesRoute

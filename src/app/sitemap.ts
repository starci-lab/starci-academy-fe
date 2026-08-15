import type {
    MetadataRoute,
} from "next"
import {
    DEFAULT_LOCALE,
    LOCALES,
} from "@/i18n/config"
import {
    apiEnv,
} from "@/modules/api/env"
import {
    localizedUrl,
    readSeoConfig,
    type SeoConfig,
} from "@/config/seo"

/** Minimal response shape selected by the sitemap discovery operation. */
interface SitemapCoursesResponse {
    /** GraphQL response payload. */
    data?: {
        /** Public course-list envelope. */
        courses?: {
            /** Paginated course rows. */
            data?: {
                /** Course route identities. */
                data?: Array<{ displayId?: string }>
            }
        }
    }
}

/** Transport boundary injected into discovery tests. */
export type SitemapFetcher = (
    input: string | URL | Request,
    init?: RequestInit,
) => Promise<Response>

const COURSE_DISCOVERY_QUERY = `
    query SitemapCourses($request: CoursesRequest!) {
        courses(request: $request) {
            data {
                data { displayId }
            }
        }
    }
`

/** Discover public course route identities; failures degrade to the catalog-only sitemap. */
export const discoverCourseDisplayIds = async (
    graphqlUrl: string,
    fetcher: SitemapFetcher = fetch,
): Promise<Array<string>> => {
    try {
        const response = await fetcher(graphqlUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: COURSE_DISCOVERY_QUERY,
                variables: {
                    request: {
                        filters: {
                            limit: 1000,
                            sorts: [
                                { by: "title", order: "ASC" },
                            ],
                        },
                    },
                },
            }),
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        })
        if (!response.ok) return []
        const payload = await response.json() as SitemapCoursesResponse
        return Array.from(new Set(
            (payload.data?.courses?.data?.data ?? [])
                .map((course) => course.displayId?.trim())
                .filter((displayId): displayId is string => Boolean(displayId)),
        ))
    } catch {
        return []
    }
}

/** Build localized catalog and course entries with matching hreflang identities. */
export const buildSitemap = (
    courseDisplayIds: ReadonlyArray<string>,
    config: SeoConfig,
): MetadataRoute.Sitemap => [
    {
        url: localizedUrl(DEFAULT_LOCALE, "/courses", config),
        changeFrequency: "weekly",
        priority: 1,
        alternates: {
            languages: Object.fromEntries(LOCALES.map((locale) => [
                locale,
                localizedUrl(locale, "/courses", config),
            ])),
        },
    },
    ...courseDisplayIds.map((displayId): MetadataRoute.Sitemap[number] => {
        const path = `/courses/${encodeURIComponent(displayId)}`
        return {
            url: localizedUrl(DEFAULT_LOCALE, path, config),
            changeFrequency: "weekly",
            priority: 0.8,
            alternates: {
                languages: Object.fromEntries(LOCALES.map((locale) => [
                    locale,
                    localizedUrl(locale, path, config),
                ])),
            },
        }
    }),
]

/** Serve a resilient public sitemap whose dynamic discovery can fail without breaking the route. */
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
    const config = readSeoConfig()
    const courseDisplayIds = await discoverCourseDisplayIds(apiEnv().graphql.url)
    return buildSitemap(courseDisplayIds, config)
}

export default sitemap

import type {
    MetadataRoute,
} from "next"
import {
    LOCALES,
} from "@/i18n/config"
import {
    type SeoConfig,
    readSeoConfig,
} from "@/config/seo"

const PRIVATE_ROUTE_PATTERNS = [
    "authentication",
    "dashboard",
    "cart",
    "notifications",
] as const

/** Build crawler policy from one deployment origin without exposing private route clusters. */
export const buildRobots = (config: SeoConfig): MetadataRoute.Robots => ({
    rules: {
        userAgent: "*",
        allow: "/",
        disallow: [
            "/api/",
            ...LOCALES.flatMap((locale) => [
                ...PRIVATE_ROUTE_PATTERNS.map((route) => `/${locale}/${route}`),
                `/${locale}/courses/*/learn`,
            ]),
        ],
    },
    sitemap: `${config.siteUrl}/sitemap.xml`,
})

/** Serve the production-aware crawler policy at `/robots.txt`. */
const robots = (): MetadataRoute.Robots => buildRobots(readSeoConfig())

export default robots

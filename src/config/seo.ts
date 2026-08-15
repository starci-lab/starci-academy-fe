import type {
    Metadata,
} from "next"
import {
    DEFAULT_LOCALE,
    LOCALES,
    type Locale,
} from "@/i18n/config"

const DEFAULT_SITE_URL = "http://localhost:3000"

/** Public deployment values used by metadata, crawl routes and future consent-gated analytics. */
export interface SeoConfig {
    /** Human-readable product name used in title templates and social cards. */
    siteName: string
    /** Absolute deployment origin without a trailing slash. */
    siteUrl: string
    /** Default description when a route has no more specific summary. */
    description: string
    /** Default social image path rooted at the deployment origin. */
    imagePath: string
    /** Optional Search Console HTML verification token. */
    googleSiteVerification: string
    /** Optional GA4 Measurement ID; no analytics loader consumes it before consent exists. */
    gaId: string
}

/** Environment-shaped inputs accepted by the pure SEO configuration builder. */
export interface SeoConfigInput {
    /** Candidate public origin. */
    siteUrl?: string
    /** Candidate Search Console token. */
    googleSiteVerification?: string
    /** Candidate GA4 Measurement ID. */
    gaId?: string
}

/** Normalize public deployment values without embedding provider-specific configuration. */
export const buildSeoConfig = ({
    siteUrl,
    googleSiteVerification,
    gaId,
}: SeoConfigInput = {}): SeoConfig => ({
    siteName: "StarCi Academy",
    siteUrl: new URL(siteUrl?.trim() || DEFAULT_SITE_URL).origin,
    description: "Learn software engineering through real projects, deliberate practice, and a clear path to professional work.",
    imagePath: "/brand/starci-ai-mark-v1.png",
    googleSiteVerification: googleSiteVerification?.trim() ?? "",
    gaId: gaId?.trim() ?? "",
})

/** Read the optional public deployment values at build or request time. */
export const readSeoConfig = (): SeoConfig => buildSeoConfig({
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    gaId: process.env.NEXT_PUBLIC_GA_ID,
})

/** Produce one absolute localized URL for a route path. */
export const localizedUrl = (
    locale: Locale,
    path: string,
    config: SeoConfig = readSeoConfig(),
) => {
    const routePath = path.startsWith("/") ? path : `/${path}`
    return `${config.siteUrl}/${locale}${routePath}`
}

/** Build canonical and hreflang links for one localized public route. */
export const localizedAlternates = (
    locale: Locale,
    path: string,
    config: SeoConfig = readSeoConfig(),
): NonNullable<Metadata["alternates"]> => ({
    canonical: localizedUrl(locale, path, config),
    languages: {
        ...Object.fromEntries(LOCALES.map((candidate) => [
            candidate,
            localizedUrl(candidate, path, config),
        ])),
        "x-default": localizedUrl(DEFAULT_LOCALE, path, config),
    },
})

/** Map an application locale to the OpenGraph locale spelling. */
export const openGraphLocale = (locale: Locale) => locale === "vi" ? "vi_VN" : "en_US"

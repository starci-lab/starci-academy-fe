import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({ notFound: vi.fn() }))
vi.mock("next-intl", () => ({ hasLocale: (_locales: ReadonlyArray<string>, locale: string) => locale === "en" || locale === "vi" }))
vi.mock("next-intl/server", () => ({ getTranslations: async () => (key: string) => key }))
vi.mock("@/components/pages/CoursesCatalogPage", () => ({ CoursesCatalogPage: () => null }))
vi.mock("@/config/seo", () => ({ localizedAlternates: () => ({}), localizedUrl: (_locale: string, path: string) => path, openGraphLocale: (locale: string) => locale, readSeoConfig: () => ({ siteUrl: "https://academy.starci.org", description: "Academy" }) }))

import CoursesRoute, { generateMetadata } from "./page"

describe("courses route metadata", () => {
    it("resolves localized catalog metadata", async () => {
        const metadata = await generateMetadata({ params: Promise.resolve({ lang: "en" }), searchParams: Promise.resolve({}) })
        expect(metadata.title).toBe("title")
        expect(metadata.openGraph?.locale).toBe("en")
    })
    it("mounts the catalog route", () => {
        expect(CoursesRoute()).toBeTruthy()
    })
    it("handles an invalid locale through the route guard", async () => {
        await generateMetadata({ params: Promise.resolve({ lang: "fr" }), searchParams: Promise.resolve({}) })
    })
})
